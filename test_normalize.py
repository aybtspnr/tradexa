import re

def normalize(name):
    """Remove acentos e caracteres especiais para comparacao."""
    if not name:
        return ''
    name = name.upper()
    replacements = {
        'Á': 'A', 'À': 'A', 'Ã': 'A', 'Â': 'A', 'Ä': 'A',
        'É': 'E', 'È': 'E', 'Ê': 'E', 'Ë': 'E',
        'Í': 'I', 'Ì': 'I', 'Î': 'I', 'Ï': 'I',
        'Ó': 'O', 'Ò': 'O', 'Õ': 'O', 'Ô': 'O', 'Ö': 'O',
        'Ú': 'U', 'Ù': 'U', 'Û': 'U', 'Ü': 'U',
        'Ç': 'C',
        'Ñ': 'N',
    }
    for acc, no_acc in replacements.items():
        name = name.replace(acc, no_acc)
    # Remove non-alphanumeric
    name = re.sub(r'[^A-Z0-9\s]', '', name)
    # Collapse spaces
    name = re.sub(r'\s+', ' ', name).strip()
    return name

# Test
names = [
    "THE LYCRA COMPANY INDÚSTRIA E COMÉRCIO TÊXTIL LTDA",
    "THE LYCRA COMPANY INDUSTRIA E COMERCIO TEXTIL LTDA",
    "RHODIA BRASIL S.A.",
    "RHODIA BRASIL S/A",
]

for n in names:
    print(f"  {n}")
    print(f"  -> {normalize(n)}")
    print()

# Check if the normalized versions match
print("MATCH?", normalize(names[0]) == normalize(names[1]))
