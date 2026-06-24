import sqlite3, re

# Test confidence score logic locally with sample data
# Then we'll deploy the real version

def calc_confidence(cnae_principal, cnaes_secundarios_str, capital_social, 
                    situacao_cadastral, nome_fantasia, single_in_city):
    score = 0
    
    # CNAE principal compatível (já está no top_cnae_codes se chegou aqui)
    score += 35
    
    # Empresa ativa
    if situacao_cadastral == '02':
        score += 15
    
    # Capital social alto
    cap = capital_social or 0
    if cap >= 100_000_000:
        score += 20
    elif cap >= 10_000_000:
        score += 15
    elif cap >= 1_000_000:
        score += 10
    elif cap >= 100_000:
        score += 5
    
    # Tem nome fantasia válido
    if nome_fantasia and nome_fantasia != 'N/I':
        score += 10
    
    # CNAEs secundários - verifica comércio exterior (4689-3)
    if cnaes_secundarios_str:
        sec_cnaes = [c.strip() for c in cnaes_secundarios_str.split(',')]
        # CNAE 4689-3/02 = Comércio atacadista de fios e fibras
        if any(c.startswith('4689') for c in sec_cnaes):
            score += 15
        # CNAE 4689-3/01 = Comércio atacadista de tecidos
        if any(c.startswith('4689') for c in sec_cnaes):
            score += 5
        # Multiple CNAEs = empresa diversificada, mais provável de operar no mercado
        if len(sec_cnaes) >= 3:
            score += 5
    
    # Única empresa na cidade com este CNAE
    if single_in_city:
        score += 10
    
    # Determinar flow type com base nos CNAEs
    principal_div = cnae_principal[:2] if len(cnae_principal) >= 2 else '00'
    
    has_trade_cnae = False
    has_manufacturing = principal_div in ['13','14','15','20','21','22','24','25','26','27','28','29','30','31']
    if cnaes_secundarios_str:
        sec_cnaes = [c.strip() for c in cnaes_secundarios_str.split(',')]
        has_trade_cnae = any(c.startswith('4689') for c in sec_cnaes)
    
    # Flow type
    if has_manufacturing and has_trade_cnae:
        flow_type = 'both'  # Fabricante que também comercializa
    elif has_manufacturing:
        flow_type = 'manufacturer'
    elif principal_div in ['46', '47'] or has_trade_cnae:
        flow_type = 'trader'
    else:
        flow_type = 'unknown'
    
    # Label
    if score >= 80:
        label = 'Alta'
        icon = '🔥'
    elif score >= 50:
        label = 'Média'
        icon = '⚡'
    else:
        label = 'Potencial'
        icon = '📌'
    
    return {
        'score': score,
        'label': label,
        'icon': icon,
        'flow_type': flow_type,
        'has_trade_cnae': has_trade_cnae
    }

# Test with Lycra Company data
result = calc_confidence(
    cnae_principal='1313800',
    cnaes_secundarios_str='',  # Lycra might not have secondary CNAEs in our DB
    capital_social=405597612,
    situacao_cadastral='02',
    nome_fantasia='THE LYCRA COMPANY INDUSTRIA E COMERCIO TEXTIL LTDA',
    single_in_city=True
)
print('THE LYCRA COMPANY:', result)

result2 = calc_confidence(
    cnae_principal='1354500',
    cnaes_secundarios_str='',
    capital_social=69870123,
    situacao_cadastral='02',
    nome_fantasia='SUOMINEN NONWOVENS',
    single_in_city=False
)
print('SUOMINEN:', result2)

result3 = calc_confidence(
    cnae_principal='2022300',
    cnaes_secundarios_str='',
    capital_social=59183459,
    situacao_cadastral='02',
    nome_fantasia='TEREFTALICOS INDUSTRIAS QUIMICAS LTDA',
    single_in_city=False
)
print('TEREFTALICOS:', result3)
