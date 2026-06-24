import sqlite3
db = sqlite3.connect("/opt/tradexa-intel-api/tradexa_intel.db")
c = db.cursor()

# Check NCM table - get FOB, Frete, Seguro for 54024400 Feb 2026
for flow, label in [('imp', 'IMPORTACAO'), ('exp', 'EXPORTACAO')]:
    c.execute(f"""
        SELECT CO_PAIS, 
               SUM(VL_FOB) as total_fob,
               SUM(VL_FRETE) as total_frete, 
               SUM(VL_SEGURO) as total_seguro,
               SUM(KG_LIQUIDO) as total_kg
        FROM comex_{flow}_2026_ncm
        WHERE CO_NCM = '54024400' AND CO_MES = '02'
        GROUP BY CO_PAIS
        ORDER BY SUM(VL_FOB) DESC
        LIMIT 5
    """)
    rows = c.fetchall()
    print(f'=== {label} NCM 54024400 - Fev/2026 ===')
    print(f'{"Pais":<20} {"FOB US$":<15} {"Frete US$":<15} {"Seguro US$":<15} {"CIF US$":<15} {"KG":<10} {"FOB/kg":<10} {"CIF/kg"}')
    print('-'*110)
    for r in rows:
        co_pais = r[0]
        fob = r[1] or 0
        frete = r[2] or 0
        seguro = r[3] or 0
        kg = r[4] or 0
        cif = fob + frete + seguro
        
        c.execute("SELECT nome_pais FROM comex_paises WHERE cod_pais=?", (co_pais,))
        nome = c.fetchone()
        nome_pais = nome[0] if nome else co_pais
        
        fob_kg = fob/kg if kg > 0 else 0
        cif_kg = cif/kg if kg > 0 else 0
        
        print(f'{nome_pais:<20} US$ {fob:>10,.2f} US$ {frete:>10,.2f} US$ {seguro:>10,.2f} US$ {cif:>10,.2f} {kg:>7,.0f} US$ {fob_kg:>5.2f} US$ {cif_kg:>5.2f}')
    
    # Totals
    c.execute(f"""
        SELECT SUM(VL_FOB), SUM(VL_FRETE), SUM(VL_SEGURO), SUM(KG_LIQUIDO)
        FROM comex_{flow}_2026_ncm
        WHERE CO_NCM = '54024400' AND CO_MES = '02'
    """)
    totals = c.fetchone()
    total_fob = totals[0] or 0
    total_frete = totals[1] or 0
    total_seguro = totals[2] or 0
    total_kg = totals[3] or 0
    total_cif = total_fob + total_frete + total_seguro
    print(f'\nTotal: FOB=US$ {total_fob:,.2f} | Frete=US$ {total_frete:,.2f} | Seguro=US$ {total_seguro:,.2f}')
    print(f'CIF=US$ {total_cif:,.2f} | Frete+Seguro={((total_frete+total_seguro)/total_cif*100):.1f}% do CIF')
    print()

db.close()
