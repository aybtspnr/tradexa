import re, sys

with open("/opt/tradexa-intel-api/api_intel.py", "r") as f:
    content = f.read()

# 1. Add RECOF check function after detect_flow
old = '''def get_scored_cnaes(c, hs_chapter, min_score=50, ncm_prefix=None):'''
new = '''def check_recof(c, razao_social, nome_fantasia):
    """Check if a company is habilitated for RECOF (special customs regime)."""
    names_to_check = []
    if razao_social and razao_social != 'N/I':
        names_to_check.append(razao_social.upper())
    if nome_fantasia and nome_fantasia != 'N/I':
        names_to_check.append(nome_fantasia.upper())
    for name in names_to_check:
        c.execute("SELECT data_habilitacao FROM recof_empresas WHERE razao_social = ?", (name,))
        row = c.fetchone()
        if row:
            return row[0]
    return None

def calc_confidence(cnae_principal, cnaes_secundarios, capital_social,
                    situacao_cadastral, nome_fantasia, is_single, is_recof):
    score = 0
    score += 35  # CNAE principal ja esta no filtro
    
    if situacao_cadastral == '02':
        score += 15
    
    cap = capital_social or 0
    if cap >= 100_000_000:
        score += 20
    elif cap >= 10_000_000:
        score += 15
    elif cap >= 1_000_000:
        score += 10
    elif cap >= 100_000:
        score += 5
    
    if nome_fantasia and nome_fantasia != 'N/I':
        score += 10
    
    if cnaes_secundarios:
        sec_list = [c.strip() for c in cnaes_secundarios.split(',')]
        if any(c.startswith('4689') for c in sec_list):
            score += 15
        if len(sec_list) >= 3:
            score += 5
    
    if is_single:
        score += 10
    
    if is_recof:
        score += 20  # RECOF = confirmadamente atuante em comercio exterior
    
    if score >= 80:
        label = 'Alta'
    elif score >= 50:
        label = 'Media'
    else:
        label = 'Potencial'
    
    return score, label

def get_flow_type(cnae_principal, cnaes_secundarios=None):
    div = cnae_principal[:2] if len(cnae_principal) >= 2 else '00'
    has_trade = False
    if cnaes_secundarios:
        sec_list = [c.strip() for c in cnaes_secundarios.split(',')]
        has_trade = any(c.startswith('4689') for c in sec_list)
    
    is_manufacturer = div in ['13','14','15','20','21','22','24','25','26','27','28','29','30','31']
    
    if is_manufacturer and has_trade:
        return 'both'
    elif is_manufacturer:
        return 'manufacturer'
    elif div in ['46', '47'] or has_trade:
        return 'trader'
    return 'unknown'

def get_scored_cnaes(c, hs_chapter, min_score=50, ncm_prefix=None):'''

content = content.replace(old, new)
print("1. Added RECOF + confidence functions")

# 2. Modify the SQL query to add columns
old_sql = '''                SELECT e.uf, e.municipio, e.cnpj_basico, 
                       COALESCE(NULLIF(e.nome_fantasia, ''), NULLIF(emp.razao_social, ''), 'N/I') as nome_fantasia,
                       emp.razao_social,
                       e.cnae_fiscal_principal as cnae, c.descricao as cnae_desc,
                       COALESCE(emp.capital_social, 0) as capital_social'''

new_sql = '''                SELECT e.uf, e.municipio, e.cnpj_basico, 
                       COALESCE(NULLIF(e.nome_fantasia, ''), NULLIF(emp.razao_social, ''), 'N/I') as nome_fantasia,
                       emp.razao_social,
                       e.cnae_fiscal_principal as cnae, c.descricao as cnae_desc,
                       COALESCE(emp.capital_social, 0) as capital_social,
                       e.cnae_fiscal_secundaria,
                       e.situacao_cadastral'''

content = content.replace(old_sql, new_sql)
print("2. Added cnae_fiscal_secundaria and situacao_cadastral to SQL")

# 3. Replace the empresa dict building with enhanced version
old_dict_start = '''                empresas_by_city[city_key].append({
                    \"cnpj_basico\": row['cnpj_basico'],
                    \"nome_fantasia\": row['nome_fantasia'],
                    \"razao_social\": row['razao_social'] or row['nome_fantasia'],
                    \"cnae_fiscal\": cnae,
                    \"cnae_desc\": row['cnae_desc'],
                    \"capital_social\": row['capital_social'],
                    \"uf\": uf,'''

new_dict_start = '''                # Calculate confidence and flow
                cnaes_sec = row['cnae_fiscal_secundaria']
                cap_soc = row['capital_social'] or 0
                sit_cad = row['situacao_cadastral'] or ''
                
                # Check if this is the only company in this city with this CNAE
                is_single = False
                city_companies = empresas_by_city.get(city_key, [])
                same_cnae_count = sum(1 for ec in city_companies if ec.get('cnae_fiscal') == cnae)
                
                # Check RECOF
                recof_date = check_recof(c, row['razao_social'], row['nome_fantasia'])
                
                # Count unique cnpj for single check
                unique_cnpj = set()
                for k, v in empresas_by_city.items():
                    for ec in v:
                        unique_cnpj.add(ec.get('cnpj_basico',''))
                
                confidence_score, confidence_label = calc_confidence(
                    cnae, cnaes_sec, cap_soc, sit_cad,
                    row['nome_fantasia'], 
                    len([1 for ec in empresas_by_city.get(city_key, []) if ec.get('cnae_fiscal') == cnae]) == 0,
                    recof_date is not None
                )
                
                flow_type = get_flow_type(cnae, cnaes_sec)

                empresas_by_city[city_key].append({
                    \"cnpj_basico\": row['cnpj_basico'],
                    \"nome_fantasia\": row['nome_fantasia'],
                    \"razao_social\": row['razao_social'] or row['nome_fantasia'],
                    \"cnae_fiscal\": cnae,
                    \"cnae_desc\": row['cnae_desc'],
                    \"capital_social\": cap_soc,
                    \"confidence_score\": confidence_score,
                    \"confidence_label\": confidence_label,
                    \"flow_type\": flow_type,
                    \"cnaes_secundarios\": cnaes_sec.split(',') if cnaes_sec else [],
                    \"recof\": recof_date is not None,
                    \"recof_date\": recof_date or '',
                    \"uf\": uf,'''

content = content.replace(old_dict_start, new_dict_start)
print("3. Updated empresa dict with confidence/flow/recof")

# 4. Remove the old "flow = detect_flow(cnae)" since we now use get_flow_type
old_flow = '''                cnae = row['cnae']
                flow = detect_flow(cnae)'''
new_flow = '''                cnae = row['cnae']'''
content = content.replace(old_flow, new_flow)
print("4. Removed old detect_flow call")

# 5. Remove old "likely_flow" since we now have flow_type
old_likely = '''                    \"likely_flow\": flow,'''
# Check if it exists
if old_likely in content:
    content = content.replace(old_likely, '')
    print("5. Removed old likely_flow")

with open("/opt/tradexa-intel-api/api_intel.py", "w") as f:
    f.write(content)

print("\nAPI modifications complete!")
