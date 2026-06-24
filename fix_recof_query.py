# Fix: the check_recof should use nome_normalizado column
import re

with open("/opt/tradexa-intel-api/api_intel.py", "r") as f:
    content = f.read()

# Fix the query to use nome_normalizado instead of razao_social
old_query = '''c.execute("SELECT data_habilitacao FROM recof_empresas WHERE razao_social = ?", (name,))'''
new_query = '''c.execute("SELECT data_habilitacao FROM recof_empresas WHERE nome_normalizado = ?", (name,))'''

if old_query in content:
    content = content.replace(old_query, new_query)
    print("Fixed query to use nome_normalizado")
else:
    print("WARNING: query not found")

with open("/opt/tradexa-intel-api/api_intel.py", "w") as f:
    f.write(content)
print("File saved")
