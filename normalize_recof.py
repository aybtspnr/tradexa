import re

new_check = '''def normalize_name(name):
    """Remove acentos e caracteres especiais para comparacao de razao social."""
    if not name:
        return ''
    name = name.upper()
    replacements = {
        'Á': 'A', 'À': 'A', 'Ã': 'A', 'Â': 'A', 'Ä': 'A',
        'É': 'E', 'È': 'E', 'Ê': 'E', 'Ë': 'E',
        'Í': 'I', 'Ì': 'I', 'Î': 'I', 'Ï': 'I',
        'Ó': 'O', 'Ò': 'O', 'Õ': 'O', 'Ô': 'O', 'Ö': 'O',
        'Ú': 'U', 'Ù': 'U', 'Û': 'U', 'Ü': 'U',
        'Ç': 'C', 'Ñ': 'N',
    }
    for acc, no_acc in replacements.items():
        name = name.replace(acc, no_acc)
    name = re.sub(r'[^A-Z0-9\\s/]', '', name)
    name = re.sub(r'\\s+', ' ', name).strip()
    return name

def check_recof(c, razao_social, nome_fantasia):
    """Check if a company is habilitated for RECOF (special customs regime)."""
    names_to_check = []
    if razao_social and razao_social != 'N/I':
        names_to_check.append(normalize_name(razao_social))
    if nome_fantasia and nome_fantasia != 'N/I':
        names_to_check.append(normalize_name(nome_fantasia))
    for name in names_to_check:
        c.execute("SELECT data_habilitacao FROM recof_empresas WHERE razao_social = ?", (name,))
        row = c.fetchone()
        if row:
            return row[0]
    return None'''

# Read the current API file
with open("/home/nuh_tapinar/tmp-build/project/current_snippet.txt", "w") as f:
    pass

print("New check_recof function ready")
print(new_check[:200])
