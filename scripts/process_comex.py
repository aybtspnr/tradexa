#!/usr/bin/env python3
"""
Processa CSVs do Comex Stat 2026 e gera JSON agregado para o Dashboard.
Uso: python3 scripts/process_comex.py
Saída: public/data/comex_intelligence.json
"""
import csv, json, os, sys
from collections import defaultdict
from datetime import datetime

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = "/mnt/c/Users/Nuh TA\u015ePINAR/Desktop/Nova pasta"
OUT_DIR = os.path.join(BASE_DIR, "public", "data")

# ── Country code mapping (MDIC/SECEX → Nome) ──
COUNTRY_MAP = {
    "000": "Não Definido",
    "013": "Afeganistão",
    "015": "Aland, Ilhas",
    "017": "Albânia",
    "020": "Alboran-Perejil, Ilhas",
    "023": "Alemanha",
    "025": "Alemanha Oriental",
    "031": "Burkina Faso",
    "037": "Andorra",
    "040": "Angola",
    "041": "Anguilla",
    "042": "Antártica",
    "043": "Antígua e Barbuda",
    "047": "Antilhas Holandesas",
    "053": "Arábia Saudita",
    "059": "Argélia",
    "063": "Argentina",
    "064": "Armênia",
    "065": "Aruba",
    "069": "Austrália",
    "072": "Áustria",
    "073": "Azerbaijão",
    "077": "Bahamas",
    "080": "Barein",
    "081": "Bangladesh",
    "083": "Barbados",
    "085": "Belarus",
    "087": "Bélgica",
    "088": "Belize",
    "090": "Bermudas",
    "093": "Mianmar",
    "097": "Bolívia",
    "098": "Bósnia-Herzegovina",
    "099": "Bonaire, Saint Eustatius e Saba",
    "100": "Internação na Zona Franca de Manaus",
    "101": "Botsuana",
    "102": "Bouvet, Ilha",
    "105": "Brasil",
    "108": "Brunei",
    "111": "Bulgária",
    "115": "Burundi",
    "119": "Butão",
    "127": "Cabo Verde",
    "137": "Cayman, Ilhas",
    "141": "Camboja",
    "145": "Camarões",
    "149": "Canadá",
    "150": "Canal, Ilhas do (Guernsey)",
    "151": "Canárias, Ilhas",
    "152": "Canal, Ilhas do (Jersey)",
    "153": "Cazaquistão",
    "154": "Catar",
    "158": "Chile",
    "160": "China",
    "161": "Taiwan (Formosa)",
    "163": "Chipre",
    "165": "Cocos (Keeling), Ilhas",
    "169": "Colômbia",
    "173": "Comores",
    "177": "Congo",
    "183": "Cook, Ilhas",
    "187": "Coreia do Norte",
    "190": "Coreia do Sul",
    "193": "Costa do Marfim",
    "195": "Croácia",
    "196": "Costa Rica",
    "198": "Coveite (Kuweit)",
    "199": "Cuba",
    "200": "Curaçao",
    "229": "Benin",
    "232": "Dinamarca",
    "235": "Dominica",
    "237": "Dubai",
    "239": "Equador",
    "240": "Egito",
    "243": "Eritreia",
    "244": "Emirados Árabes Unidos",
    "245": "Espanha",
    "246": "Eslovênia",
    "247": "Eslováquia",
    "249": "Estados Unidos",
    "251": "Estônia",
    "253": "Etiópia",
    "255": "Falkland (Malvinas)",
    "259": "Faroe, Ilhas",
    "267": "Filipinas",
    "271": "Finlândia",
    "275": "França",
    "281": "Gabão",
    "285": "Gâmbia",
    "289": "Gana",
    "291": "Geórgia",
    "292": "Geórgia do Sul e Sandwich do Sul, Ilhas",
    "293": "Gibraltar",
    "297": "Granada",
    "301": "Grécia",
    "305": "Groenlândia",
    "309": "Guadalupe",
    "313": "Guam",
    "317": "Guatemala",
    "321": "Guernsey",
    "325": "Guiana Francesa",
    "329": "Guiné",
    "331": "Guiné Equatorial",
    "334": "Guiné-Bissau",
    "337": "Guiana",
    "341": "Haiti",
    "343": "Heard e ilhas mcdonald, Ilha",
    "345": "Honduras",
    "351": "Hong Kong",
    "355": "Hungria",
    "357": "Iêmen",
    "358": "Iêmen Democrático",
    "359": "Ilha de Man",
    "361": "Índia",
    "365": "Indonésia",
    "367": "Inglaterra",
    "369": "Iraque",
    "372": "Irã",
    "375": "Irlanda",
    "379": "Islândia",
    "383": "Israel",
    "386": "Itália",
    "388": "Iugoslávia",
    "391": "Jamaica",
    "393": "Jersey",
    "396": "Johnston, Ilhas",
    "399": "Japão",
    "403": "Jordânia",
    "411": "Kiribati",
    "420": "Laos",
    "423": "Lebuan, Ilhas",
    "426": "Lesoto",
    "427": "Letônia",
    "431": "Líbano",
    "434": "Libéria",
    "438": "Líbia",
    "440": "Liechtenstein",
    "442": "Lituânia",
    "445": "Luxemburgo",
    "447": "Macau",
    "449": "Macedônia",
    "450": "Madagascar",
    "452": "Madeira, Ilha da",
    "455": "Malásia",
    "458": "Malavi",
    "461": "Maldivas",
    "464": "Mali",
    "467": "Malta",
    "472": "Marianas do Norte, Ilhas",
    "474": "Marrocos",
    "476": "Marshall, Ilhas",
    "477": "Martinica",
    "485": "Maurício",
    "488": "Mauritânia",
    "489": "Mayotte",
    "490": "Midway, Ilhas",
    "493": "México",
    "494": "Moldávia",
    "495": "Mônaco",
    "497": "Mongólia",
    "498": "Montenegro",
    "499": "Micronésia",
    "501": "Montserrat",
    "505": "Moçambique",
    "507": "Namíbia",
    "508": "Nauru",
    "511": "Christmas (Navidad), Ilha",
    "517": "Nepal",
    "521": "Nicarágua",
    "525": "Níger",
    "528": "Nigéria",
    "531": "Niue",
    "535": "Norfolk, Ilha",
    "538": "Noruega",
    "542": "Nova Caledônia",
    "545": "Papua Nova Guiné",
    "548": "Nova Zelândia",
    "551": "Vanuatu",
    "556": "Omã",
    "563": "Pacífico, Ilhas do (Administração dos EUA)",
    "566": "Pacífico, Ilhas do (EUA)",
    "569": "Pacífico, Ilhas do (Território Fideicomisso EUA)",
    "573": "Países Baixos (Holanda)",
    "575": "Palau",
    "576": "Paquistão",
    "578": "Palestina",
    "580": "Panamá",
    "583": "Papua, Território de",
    "586": "Paraguai",
    "589": "Peru",
    "593": "Pitcairn",
    "599": "Polinésia Francesa",
    "603": "Polônia",
    "607": "Portugal",
    "611": "Porto Rico",
    "623": "Quênia",
    "625": "Quirguistão",
    "628": "Reino Unido",
    "640": "República Centro-Africana",
    "647": "República Dominicana",
    "660": "Reunião",
    "665": "Zimbábue",
    "670": "Romênia",
    "675": "Ruanda",
    "676": "Rússia",
    "677": "Salomão, Ilhas",
    "678": "Saint Kitts e Nevis",
    "685": "Saara Ocidental",
    "687": "El Salvador",
    "690": "Samoa",
    "691": "Samoa Americana",
    "693": "São Bartolomeu",
    "695": "São Cristóvão e Névis",
    "697": "San Marino",
    "698": "São Martinho, Ilha de (parte francesa)",
    "699": "Sint Maarten",
    "700": "São Pedro e Miquelon",
    "705": "São Vicente e Granadinas",
    "710": "Santa Helena",
    "715": "Santa Lúcia",
    "720": "São Tomé e Príncipe",
    "728": "Senegal",
    "731": "Seicheles",
    "735": "Serra Leoa",
    "737": "Sérvia",
    "741": "Cingapura",
    "744": "Síria",
    "748": "Somália",
    "750": "Sri Lanka",
    "754": "Suazilândia",
    "755": "Svalbard e Jan Mayen",
    "756": "África do Sul",
    "759": "Sudão",
    "760": "Sudão do Sul",
    "764": "Suécia",
    "767": "Suíça",
    "770": "Suriname",
    "772": "Tadjiquistão",
    "776": "Tailândia",
    "780": "Tanzânia",
    "781": "Terras Austrais Francesas",
    "782": "Território Britânico do Oceano Índico",
    "783": "Djibuti",
    "785": "Território da Alta Comissão do Pacífico Ocidental",
    "786": "Território Antártico Britânico",
    "788": "Chade",
    "790": "Tchecoslováquia",
    "791": "Tcheca, República",
    "795": "Timor Leste",
    "800": "Togo",
    "805": "Toquelau",
    "810": "Tonga",
    "815": "Trinidad e Tobago",
    "820": "Tunísia",
    "823": "Turcas e Caicos, Ilhas",
    "824": "Turcomenistão",
    "827": "Turquia",
    "828": "Tuvalu",
    "831": "Ucrânia",
    "833": "Uganda",
    "840": "União das Repúblicas Socialistas Soviéticas",
    "845": "Uruguai",
    "847": "Uzbequistão",
    "848": "Vaticano",
    "850": "Venezuela",
    "858": "Vietnã",
    "863": "Virgens, Ilhas (Britânicas)",
    "866": "Virgens, Ilhas (Americanas)",
    "870": "Fiji",
    "873": "Wake, Ilha",
    "875": "Wallis e Futuna, Ilhas",
    "888": "Congo, República Democrática",
    "890": "Zâmbia",
    "895": "Zona do Canal do Panamá",
    "990": "Provisão de Navios e Aeronaves",
    "994": "A Designar",
    "995": "Bancos Centrais",
    "997": "Organizações Internacionais",
    "998": "Sem informação",
    "999": "Não Declarados",
}

VIA_MAP = {"01": "Marítimo", "04": "Rodoviário", "07": "Aéreo", "15": "Ferroviário",
           "00": "Não declarado", "09": "Vias Naveg. Interiores", "06": "Outros"}

# UF → IBGE state code prefix
UF_TO_PREFIX = {
    "RO":"11","AC":"12","AM":"13","RR":"14","PA":"15","AP":"16","TO":"17",
    "MA":"21","PI":"22","CE":"23","RN":"24","PB":"25","PE":"26","AL":"27","SE":"28","BA":"29",
    "MG":"31","ES":"32","RJ":"33","SP":"35","PR":"41","SC":"42","RS":"43",
    "MS":"50","MT":"51","GO":"52","DF":"53"
}

# ── Load IBGE municipality mapping ──
MUN_MAP = {}
try:
    ibge_path = os.path.join(BASE_DIR, "public", "data", "ibge_municipios.json")
    if os.path.exists(ibge_path):
        with open(ibge_path, "r", encoding="utf-8") as f:
            ibge_data = json.load(f)
        for c in ibge_data:
            code = str(c["municipio-id"])
            MUN_MAP[code] = f"{c['municipio-nome']} ({c['UF-sigla']})"
        print(f"  IBGE: {len(MUN_MAP)} municipios carregados")
except Exception as e:
    print(f"  IBGE: não carregado ({e})")

def get_mun_name(uf: str, code: str) -> str:
    """Look up municipality name from Comex code → IBGE code."""
    prefix = UF_TO_PREFIX.get(uf, "")
    if not prefix:
        return f"{uf}-{code}"
    ibge_code = prefix + code[-5:]  # Use last 5 digits + state prefix
    return MUN_MAP.get(ibge_code, f"{uf}-{code}")


def aggregate_csv(filename, prefix):
    filepath = os.path.join(DATA_DIR, filename)
    if not os.path.exists(filepath):
        print(f"  [SKIP] {filename} not found")
        return {}

    print(f"  Processing {filename}...")
    result = {
        "top_ncms": defaultdict(lambda: {"fob": 0, "kg": 0, "count": 0, "frete": 0, "seguro": 0}),
        "top_countries": defaultdict(lambda: {"fob": 0, "kg": 0, "count": 0, "frete": 0, "seguro": 0}),
        "monthly": defaultdict(lambda: {"fob": 0, "count": 0, "frete": 0}),
        "by_state": defaultdict(lambda: {"fob": 0, "count": 0, "frete": 0}),
        "by_via": defaultdict(lambda: {"fob": 0, "count": 0, "frete": 0}),
        "top_ncm_country": defaultdict(lambda: defaultdict(lambda: {"fob": 0, "kg": 0, "frete": 0})),
        "total_fob": 0,
        "total_kg": 0,
        "total_frete": 0,
        "total_seguro": 0,
        "total_count": 0,
    }

    with open(filepath, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f, delimiter=";")
        for row_num, row in enumerate(reader, 1):
            try:
                fob = float(row.get("VL_FOB", 0))
                kg = float(row.get("KG_LIQUIDO", 0))
                frete = float(row.get("VL_FRETE", 0))
                seguro = float(row.get("VL_SEGURO", 0))
            except (ValueError, TypeError):
                continue

            ncm = row.get("CO_NCM", "")
            pais = row.get("CO_PAIS", "")
            mes = row.get("CO_MES", "")
            uf = row.get("SG_UF_NCM", "ND")
            via = row.get("CO_VIA", "00")

            result["top_ncms"][ncm]["fob"] += fob
            result["top_ncms"][ncm]["kg"] += kg
            result["top_ncms"][ncm]["count"] += 1
            result["top_ncms"][ncm]["frete"] += frete
            result["top_ncms"][ncm]["seguro"] += seguro

            result["top_countries"][pais]["fob"] += fob
            result["top_countries"][pais]["kg"] += kg
            result["top_countries"][pais]["count"] += 1
            result["top_countries"][pais]["frete"] += frete
            result["top_countries"][pais]["seguro"] += seguro

            result["monthly"][mes]["fob"] += fob
            result["monthly"][mes]["count"] += 1
            result["monthly"][mes]["frete"] += frete

            if uf:
                result["by_state"][uf]["fob"] += fob
                result["by_state"][uf]["count"] += 1
                result["by_state"][uf]["frete"] += frete

            if via:
                result["by_via"][via]["fob"] += fob
                result["by_via"][via]["count"] += 1
                result["by_via"][via]["frete"] += frete

            if ncm and pais:
                result["top_ncm_country"][ncm][pais]["fob"] += fob
                result["top_ncm_country"][ncm][pais]["kg"] += kg
                result["top_ncm_country"][ncm][pais]["frete"] += frete

            result["total_fob"] += fob
            result["total_kg"] += kg
            result["total_frete"] += frete
            result["total_seguro"] += seguro
            result["total_count"] += 1

    return result


def aggregate_mun_csv(filename, prefix):
    """Aggregate municipality-level CSV (SH4 + CO_MUN)."""
    filepath = os.path.join(DATA_DIR, filename)
    if not os.path.exists(filepath):
        print(f"  [SKIP] {filename} not found")
        return [], [], {}, 0

    print(f"  Processing {filename}...")
    by_mun = defaultdict(lambda: {"fob": 0, "kg": 0, "count": 0})
    total_fob = 0

    with open(filepath, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f, delimiter=";")
        for row in reader:
            try:
                fob = float(row.get("VL_FOB", 0))
                kg = float(row.get("KG_LIQUIDO", 0))
            except (ValueError, TypeError):
                continue
            uf = row.get("SG_UF_MUN", "")
            code = row.get("CO_MUN", "")
            if not code:
                continue
            key = f"{uf}-{code}"
            by_mun[key]["fob"] += fob
            by_mun[key]["kg"] += kg
            by_mun[key]["count"] += 1
            total_fob += fob

    sorted_muns = sorted(by_mun.items(), key=lambda x: x[1]["fob"], reverse=True)
    result = []
    all_result = []
    for i, (key, vals) in enumerate(sorted_muns, 1):
        uf = key.split("-")[0]
        code = key.split("-")[1]
        name = get_mun_name(uf, code)
        item = {
            "code": code,
            "uf": uf,
            "name": name,
            "fob": round(vals["fob"], 2),
            "kg": round(vals["kg"], 2),
            "count": vals["count"],
            "rank": i,
        }
        if i <= 50:
            result.append(item)
        all_result.append(item)

    return result, all_result, by_mun, total_fob


def format_top_ncms(data, limit=30):
    sorted_items = sorted(data["top_ncms"].items(), key=lambda x: x[1]["fob"], reverse=True)
    result = []
    for i, (ncm, vals) in enumerate(sorted_items[:limit], 1):
        result.append({
            "ncm": ncm, "hs4": ncm[:4], "hs2": ncm[:2],
            "fob": round(vals["fob"], 2), "kg": round(vals["kg"], 2),
            "frete": round(vals["frete"], 2), "seguro": round(vals["seguro"], 2),
            "count": vals["count"], "rank": i,
        })
    return result, sorted_items


def format_top_countries(data, limit=30):
    sorted_items = sorted(data["top_countries"].items(), key=lambda x: x[1]["fob"], reverse=True)
    result = []
    for i, (code, vals) in enumerate(sorted_items[:limit], 1):
        result.append({
            "code": code, "name": COUNTRY_MAP.get(code, f"País {code}"),
            "fob": round(vals["fob"], 2), "kg": round(vals["kg"], 2),
            "frete": round(vals["frete"], 2), "seguro": round(vals["seguro"], 2),
            "count": vals["count"], "rank": i,
        })
    return result, sorted_items


def format_monthly(data):
    result = []
    for mes in sorted(data["monthly"].keys()):
        result.append({
            "month": mes, "fob": round(data["monthly"][mes]["fob"], 2),
            "count": data["monthly"][mes]["count"],
            "frete": round(data["monthly"][mes]["frete"], 2),
        })
    return result


def format_by_state(data):
    sorted_items = sorted(data["by_state"].items(), key=lambda x: x[1]["fob"], reverse=True)
    return [{"uf": uf, "fob": round(vals["fob"], 2), "count": vals["count"], "rank": i+1}
            for i, (uf, vals) in enumerate(sorted_items)] if sorted_items else []


def format_by_via(data):
    sorted_items = sorted(data["by_via"].items(), key=lambda x: x[1]["fob"], reverse=True)
    return [{"via": via, "name": VIA_MAP.get(via, f"Código {via}"),
             "fob": round(vals["fob"], 2), "count": vals["count"], "rank": i+1}
            for i, (via, vals) in enumerate(sorted_items)] if sorted_items else []


def main():
    print("═" * 60)
    print("Comex Stat 2026 → Intelligence Dashboard")
    print("═" * 60)

    os.makedirs(OUT_DIR, exist_ok=True)

    # Process main CSVs
    exp = aggregate_csv("EXP_2026.csv", "exp")
    imp = aggregate_csv("IMP_2026.csv", "imp")

    # Process municipality CSVs
    exp_mun, all_exp_mun, _, exp_mun_total = aggregate_mun_csv("EXP_2026_MUN.csv", "exp")
    imp_mun, all_imp_mun, _, imp_mun_total = aggregate_mun_csv("IMP_2026_MUN.csv", "imp")

    # Format outputs
    exp_ncms, all_exp_ncms = format_top_ncms(exp, 30)
    imp_ncms, all_imp_ncms = format_top_ncms(imp, 30)

    exp_countries, all_exp_countries = format_top_countries(exp, 30)
    imp_countries, all_imp_countries = format_top_countries(imp, 30)

    # Generate all_countries (all, not just top 30)
    all_countries_exp = [
        {"code": code, "name": COUNTRY_MAP.get(code, f"País {code}"),
         "fob": round(v["fob"], 2), "kg": round(v["kg"], 2),
         "frete": round(v["frete"], 2), "seguro": round(v["seguro"], 2),
         "count": v["count"]}
        for code, v in all_exp_countries
    ]
    all_countries_imp = [
        {"code": code, "name": COUNTRY_MAP.get(code, f"País {code}"),
         "fob": round(v["fob"], 2), "kg": round(v["kg"], 2),
         "frete": round(v["frete"], 2), "seguro": round(v["seguro"], 2),
         "count": v["count"]}
        for code, v in all_imp_countries
    ]

    all_ncms_exp = [
        {"ncm": ncm, "hs4": ncm[:4], "hs2": ncm[:2], "fob": round(v["fob"], 2), "kg": round(v["kg"], 2)}
        for ncm, v in all_exp_ncms
    ]
    all_ncms_imp = [
        {"ncm": ncm, "hs4": ncm[:4], "hs2": ncm[:2], "fob": round(v["fob"], 2), "kg": round(v["kg"], 2)}
        for ncm, v in all_imp_ncms
    ]

    output = {
        "meta": {
            "source": "Tradexa Intelligence",
            "period": "Jan-Abr 2026",
            "generated": datetime.now().isoformat(),
            "exp_lines": exp["total_count"],
            "imp_lines": imp["total_count"],
            "total_lines": exp["total_count"] + imp["total_count"],
        },
        "export": {
            "total_fob": round(exp["total_fob"], 2),
            "total_kg": round(exp["total_kg"], 2),
            "total_frete": round(exp["total_frete"], 2),
            "total_seguro": round(exp["total_seguro"], 2),
            "total_lines": exp["total_count"],
            "ncm_count": len(exp["top_ncms"]),
            "country_count": len(exp["top_countries"]),
            "top_ncms": exp_ncms,
            "top_countries": exp_countries,
            "all_countries": all_countries_exp,
            "monthly": format_monthly(exp),
            "by_state": format_by_state(exp),
            "by_via": format_by_via(exp),
            "all_ncms": all_ncms_exp,
            "top_municipios": exp_mun,
            "all_municipios": all_exp_mun,
            "municipio_total_fob": round(exp_mun_total, 2),
        },
        "import": {
            "total_fob": round(imp["total_fob"], 2),
            "total_kg": round(imp["total_kg"], 2),
            "total_frete": round(imp["total_frete"], 2),
            "total_seguro": round(imp["total_seguro"], 2),
            "total_lines": imp["total_count"],
            "ncm_count": len(imp["top_ncms"]),
            "country_count": len(imp["top_countries"]),
            "top_ncms": imp_ncms,
            "top_countries": imp_countries,
            "all_countries": all_countries_imp,
            "monthly": format_monthly(imp),
            "by_state": format_by_state(imp),
            "by_via": format_by_via(imp),
            "all_ncms": all_ncms_imp,
            "top_municipios": imp_mun,
            "all_municipios": all_imp_mun,
            "municipio_total_fob": round(imp_mun_total, 2),
        },
        "countries": COUNTRY_MAP,
    }

    out_path = os.path.join(OUT_DIR, "comex_intelligence.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=1)

    file_size = os.path.getsize(out_path) / 1024 / 1024
    print(f"\n✅ JSON gerado: {out_path} ({file_size:.1f} MB)")
    print(f"\n📊 Resumo:")
    print(f"   Exportações: {exp['total_count']:,} linhas | ${exp['total_fob']:,.0f}")
    print(f"   Importações: {imp['total_count']:,} linhas | ${imp['total_fob']:,.0f}")
    print(f"   Top NCMs: {len(exp_ncms)} exp + {len(imp_ncms)} imp")
    print(f"   Top países: {len(exp_countries)} exp + {len(imp_countries)} imp")
    print(f"   Top municípios: {len(exp_mun)} exp + {len(imp_mun)} imp")
    print(f"   Total países mapeados: {len(COUNTRY_MAP)}")
    print(f"   Total municípios mapeados: {len(MUN_MAP)}")

    missing_countries = set()
    for data, label in [(exp, "exp"), (imp, "imp")]:
        for code in data["top_countries"]:
            if code not in COUNTRY_MAP:
                missing_countries.add(code)
    if missing_countries:
        print(f"\n⚠️ Países sem mapeamento: {sorted(missing_countries)}")


if __name__ == "__main__":
    main()
