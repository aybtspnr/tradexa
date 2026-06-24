"use client";

import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Upload, FileJson, Database, Search, Trash2, Edit, CheckCircle2, AlertCircle, Loader2, Download } from "lucide-react";
import { showError, showSuccess } from "@/utils/toast";
import { PageTransition, PremiumCard } from "@/components/premium";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface NcmEntry {
  code: string;
  description: string;
  ii?: number;
  ipi?: number;
  pis?: number;
  cofins?: number;
}

interface NcmRecord {
  id: string;
  code: string;
  description: string;
  ii?: number | null;
  ipi?: number | null;
  pis?: number | null;
  cofins?: number | null;
  created_at: string;
}

const AdminNcmManagement = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [ncmData, setNcmData] = useState<NcmRecord[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<NcmEntry[]>([]);
  const [editingEntry, setEditingEntry] = useState<NcmRecord | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const fetchNcmData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("ncms")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      setNcmData(data || []);
      
      const { count } = await supabase
        .from("ncms")
        .select("*", { count: "exact", head: true });
      
      setTotalCount(count || 0);
    } catch (error: any) {
      showError("Erro ao carregar dados: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const normalizeNcmEntry = (entry: any): NcmEntry | null => {
    const code = entry.code || entry.ncm || entry.codigo || entry.codigo_ncm;
    const description = entry.description || entry.descricao || entry.descricao_pt || entry.descricao_ncm || entry.desc;
    
    if (!code || !description) {
      return null;
    }

    return {
      code: String(code),
      description: String(description),
      ii: entry.ii ?? entry.importacao ?? entry.import_tax ?? null,
      ipi: entry.ipi ?? entry.ipi_tax ?? null,
      pis: entry.pis ?? entry.pis_tax ?? null,
      cofins: entry.cofins ?? entry.cofins_tax ?? null,
    };
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/json") {
      showError("Por favor, selecione um arquivo JSON válido.");
      return;
    }

    setUploading(true);
    try {
      const text = await file.text();
      const jsonData: any[] = JSON.parse(text);

      if (!Array.isArray(jsonData) || jsonData.length === 0) {
        throw new Error("O arquivo JSON deve conter um array de entradas NCM.");
      }

      const normalizedEntries: NcmEntry[] = [];
      const invalidEntries: number[] = [];

      jsonData.forEach((entry, index) => {
        const normalized = normalizeNcmEntry(entry);
        if (normalized) {
          normalizedEntries.push(normalized);
        } else {
          invalidEntries.push(index + 1);
        }
      });

      if (invalidEntries.length > 0) {
        throw new Error(
          `${invalidEntries.length} entradas inválidas nas posições: ${invalidEntries.slice(0, 5).join(', ')}${invalidEntries.length > 5 ? '...' : ''}. ` +
          `Cada entrada deve ter 'code' ou 'ncm' E 'description' ou 'descricao'.`
        );
      }

      if (normalizedEntries.length === 0) {
        throw new Error("Nenhuma entrada válida encontrada no arquivo JSON.");
      }

      setPreviewData(normalizedEntries.slice(0, 10));
      setShowPreview(true);
      (fileInputRef.current as any)._fullData = normalizedEntries;
      
      showSuccess(`${normalizedEntries.length} entradas NCM válidas encontradas!`);
    } catch (error: any) {
      showError("Erro ao processar arquivo: " + error.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleImport = async () => {
    const jsonData: NcmEntry[] = (fileInputRef.current as any)?._fullData || [];
    
    if (jsonData.length === 0) {
      showError("Nenhum dado para importar.");
      return;
    }

    setUploading(true);
    try {
      // Process in batches of 100 to avoid timeout
      const batchSize = 100;
      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < jsonData.length; i += batchSize) {
        const batch = jsonData.slice(i, i + batchSize);
        
        const upsertData = batch.map((entry) => ({
          code: entry.code.replace(/\D/g, ""),
          description: entry.description,
          ii: entry.ii || null,
          ipi: entry.ipi || null,
          pis: entry.pis || null,
          cofins: entry.cofins || null,
        }));

        // First try to insert
        const { data: insertedData, error: insertError } = await supabase
          .from("ncms")
          .insert(upsertData)
          .select();

        if (insertError) {
          // If there's a conflict error, try updating existing ones
          if (insertError.code === '23505') {
            for (const item of upsertData) {
              const { error: updateError } = await supabase
                .from("ncms")
                .update({
                  description: item.description,
                  ii: item.ii,
                  ipi: item.ipi,
                  pis: item.pis,
                  cofins: item.cofins,
                })
                .eq("code", item.code);
              
              if (updateError) {
                errorCount++;
                console.error("Error updating:", updateError);
              } else {
                successCount++;
              }
            }
          } else {
            throw insertError;
          }
        } else {
          successCount += insertedData?.length || 0;
        }
      }

      showSuccess(`${successCount} códigos NCM importados com sucesso!${errorCount > 0 ? ` (${errorCount} erros)` : ''}`);
      setShowPreview(false);
      fetchNcmData();
    } catch (error: any) {
      showError("Erro ao importar: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este código NCM?")) return;

    try {
      const { error } = await supabase
        .from("ncms")
        .delete()
        .eq("id", id);

      if (error) throw error;

      showSuccess("Código NCM excluído!");
      fetchNcmData();
    } catch (error: any) {
      showError("Erro ao excluir: " + error.message);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingEntry) return;

    try {
      const { error } = await supabase
        .from("ncms")
        .update({
          code: editingEntry.code.replace(/\D/g, ""),
          description: editingEntry.description,
          ii: editingEntry.ii || null,
          ipi: editingEntry.ipi || null,
          pis: editingEntry.pis || null,
          cofins: editingEntry.cofins || null,
        })
        .eq("id", editingEntry.id);

      if (error) throw error;

      showSuccess("Código NCM atualizado!");
      setIsEditing(false);
      setEditingEntry(null);
      fetchNcmData();
    } catch (error: any) {
      showError("Erro ao atualizar: " + error.message);
    }
  };

  const handleDownloadTemplate = () => {
    const template: NcmEntry[] = [
      {
        code: "8517.12.00",
        description: "Aparelhos telefônicos celulares (celulares)",
        ii: 16,
        ipi: 10,
        pis: 1.65,
        cofins: 7.6,
      },
      {
        code: "8471.30.12",
        description: "Máquinas automáticas para processamento de dados, portáteis",
        ii: 16,
        ipi: 10,
        pis: 1.65,
        cofins: 7.6,
      },
    ];

    const blob = new Blob([JSON.stringify(template, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "template-ncm.json";
    link.click();
    showSuccess("Template baixado!");
  };

  const filteredData = ncmData.filter(
    (item) =>
      item.code.includes(searchTerm) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    
      <PageTransition>
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <PremiumCard className="border-none bg-gradient-to-br from-blue-500 to-cyan-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black text-blue-100 uppercase tracking-widest">Total de Códigos</p>
                    <p className="text-4xl font-black mt-2">{totalCount}</p>
                  </div>
                  <Database className="w-12 h-12 text-white/30" />
                </div>
              </CardContent>
            </PremiumCard>

            <PremiumCard className="border-none bg-gradient-to-br from-green-500 to-blue-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black text-green-100 uppercase tracking-widest">Com Aliquotas</p>
                    <p className="text-4xl font-black mt-2">
                      {ncmData.filter((n) => n.ii || n.ipi || n.pis || n.cofins).length}
                    </p>
                  </div>
                  <CheckCircle2 className="w-12 h-12 text-white/30" />
                </div>
              </CardContent>
            </PremiumCard>

            <PremiumCard className="border-none bg-gradient-to-br from-purple-500 to-violet-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black text-purple-100 uppercase tracking-widest">Última Atualização</p>
                    <p className="text-lg font-black mt-2">
                      {ncmData[0]?.created_at
                        ? new Date(ncmData[0].created_at).toLocaleDateString("pt-BR")
                        : "N/A"}
                    </p>
                  </div>
                  <FileJson className="w-12 h-12 text-white/30" />
                </div>
              </CardContent>
            </PremiumCard>
          </div>

          <PremiumCard className="border-none">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Upload className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">Importar Base NCM</h3>
                  <p className="text-sm text-slate-600 font-medium">Upload de arquivo JSON com códigos e alíquotas</p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-6">
                <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-blue-600" />
                  Formatos Aceitos
                </h4>
                <p className="text-sm text-blue-800 mb-4">
                  O sistema aceita múltiplos nomes de campos:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-bold text-blue-900 mb-2">Código:</p>
                    <ul className="space-y-1 text-blue-700">
                      <li>• code, ncm, codigo, codigo_ncm</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-bold text-blue-900 mb-2">Descrição:</p>
                    <ul className="space-y-1 text-blue-700">
                      <li>• description, descricao, descricao_pt</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="ncm-upload"
                  />
                  <Label
                    htmlFor="ncm-upload"
                    className="flex items-center gap-3 px-6 py-4 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300 cursor-pointer hover:border-red-500 hover:bg-red-50 transition-all"
                  >
                    <FileJson className="w-8 h-8 text-slate-600" />
                    <div className="text-left">
                      <p className="font-bold text-slate-700">Selecionar arquivo JSON</p>
                      <p className="text-xs text-slate-600">Aceita: code/ncm + description/descricao</p>
                    </div>
                  </Label>
                  
                  <Button
                    onClick={handleDownloadTemplate}
                    variant="outline"
                    className="rounded-xl gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Baixar Template
                  </Button>
                </div>

                {uploading && (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-red-600" />
                    <p className="text-slate-600 font-bold ml-4">Processando arquivo...</p>
                  </div>
                )}
              </div>
            </CardContent>
          </PremiumCard>

          <PremiumCard className="border-none">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-slate-700 to-slate-800 rounded-2xl flex items-center justify-center shadow-lg">
                    <Search className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900">Códigos NCM Cadastrados</h3>
                    <p className="text-sm text-slate-600 font-medium">Visualize e gerencie os códigos</p>
                  </div>
                </div>
                <div className="relative w-96">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
                  <Input
                    placeholder="Buscar por código ou descrição..."
                    className="rounded-xl h-12 pl-12 bg-slate-50 border-slate-200"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-red-600" />
                </div>
              ) : (
                <div className="rounded-xl border border-slate-200 overflow-hidden">
                  <Table>
                    <TableHeader className="bg-slate-50">
                      <TableRow>
                        <TableHead className="font-bold w-[150px]">Código</TableHead>
                        <TableHead className="font-bold">Descrição</TableHead>
                        <TableHead className="font-bold w-[100px] text-center">II</TableHead>
                        <TableHead className="font-bold w-[100px] text-center">IPI</TableHead>
                        <TableHead className="font-bold w-[100px] text-center">PIS</TableHead>
                        <TableHead className="font-bold w-[100px] text-center">COFINS</TableHead>
                        <TableHead className="font-bold w-[150px] text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredData.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="h-32 text-center text-slate-600">
                            {searchTerm ? "Nenhum código encontrado." : "Nenhum código cadastrado. Importe um arquivo JSON."}
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredData.slice(0, 50).map((item) => (
                          <TableRow key={item.id} className="hover:bg-slate-50">
                            <TableCell className="font-mono font-bold text-red-600">{item.code}</TableCell>
                            <TableCell className="text-sm text-slate-700">{item.description}</TableCell>
                            <TableCell className="text-center text-sm">{item.ii ? `${item.ii}%` : "—"}</TableCell>
                            <TableCell className="text-center text-sm">{item.ipi ? `${item.ipi}%` : "—"}</TableCell>
                            <TableCell className="text-center text-sm">{item.pis ? `${item.pis}%` : "—"}</TableCell>
                            <TableCell className="text-center text-sm">{item.cofins ? `${item.cofins}%` : "—"}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 rounded-lg text-blue-600 hover:bg-blue-50"
                                  onClick={() => {
                                    setEditingEntry(item);
                                    setIsEditing(true);
                                  }}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 rounded-lg text-red-600 hover:bg-red-50"
                                  onClick={() => handleDelete(item.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}

              {filteredData.length > 50 && (
                <div className="flex items-center justify-center py-4 text-sm text-slate-600 font-bold">
                  Mostrando 50 de {filteredData.length} resultados
                </div>
              )}
            </CardContent>
          </PremiumCard>

          <Dialog open={showPreview} onOpenChange={setShowPreview}>
            <DialogContent className="rounded-2xl max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-black text-xl">Pré-visualização da Importação</DialogTitle>
                <DialogDescription className="text-slate-600 text-sm mt-2">
                  Primeiros 10 registros do arquivo.
                </DialogDescription>
              </DialogHeader>

              <div className="py-6">
                <div className="rounded-xl border border-slate-200 overflow-hidden">
                  <Table>
                    <TableHeader className="bg-slate-50">
                      <TableRow>
                        <TableHead className="font-bold">Código</TableHead>
                        <TableHead className="font-bold">Descrição</TableHead>
                        <TableHead className="font-bold text-center">II</TableHead>
                        <TableHead className="font-bold text-center">IPI</TableHead>
                        <TableHead className="font-bold text-center">PIS</TableHead>
                        <TableHead className="font-bold text-center">COFINS</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {previewData.map((item, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-mono font-bold text-red-600">{item.code}</TableCell>
                          <TableCell className="text-sm">{item.description}</TableCell>
                          <TableCell className="text-center text-sm">{item.ii ? `${item.ii}%` : "—"}</TableCell>
                          <TableCell className="text-center text-sm">{item.ipi ? `${item.ipi}%` : "—"}</TableCell>
                          <TableCell className="text-center text-sm">{item.pis ? `${item.pis}%` : "—"}</TableCell>
                          <TableCell className="text-center text-sm">{item.cofins ? `${item.cofins}%` : "—"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <DialogFooter className="gap-3">
                <Button
                  variant="ghost"
                  onClick={() => setShowPreview(false)}
                  className="rounded-xl font-bold"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleImport}
                  disabled={uploading}
                  className="bg-red-600 hover:bg-red-700 rounded-xl font-bold h-12 px-8 gap-2"
                >
                  {uploading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Importando...</>
                  ) : (
                    <><CheckCircle2 className="w-4 h-4" /> Confirmar Importação</>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isEditing} onOpenChange={setIsEditing}>
            <DialogContent className="rounded-2xl max-w-2xl">
              <DialogHeader>
                <DialogTitle className="font-black text-xl">Editar Código NCM</DialogTitle>
              </DialogHeader>

              {editingEntry && (
                <div className="space-y-6 py-6">
                  <div className="space-y-2">
                    <Label className="font-bold text-slate-700">Código NCM</Label>
                    <Input
                      value={editingEntry.code}
                      onChange={(e) => setEditingEntry({ ...editingEntry, code: e.target.value })}
                      className="rounded-xl h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold text-slate-700">Descrição</Label>
                    <Textarea
                      value={editingEntry.description}
                      onChange={(e) => setEditingEntry({ ...editingEntry, description: e.target.value })}
                      className="rounded-xl min-h-[100px]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="font-bold text-slate-700">II (%)</Label>
                      <Input
                        type="number"
                        value={editingEntry.ii || ""}
                        onChange={(e) => setEditingEntry({ ...editingEntry, ii: parseFloat(e.target.value) || 0 })}
                        className="rounded-xl h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-bold text-slate-700">IPI (%)</Label>
                      <Input
                        type="number"
                        value={editingEntry.ipi || ""}
                        onChange={(e) => setEditingEntry({ ...editingEntry, ipi: parseFloat(e.target.value) || 0 })}
                        className="rounded-xl h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-bold text-slate-700">PIS (%)</Label>
                      <Input
                        type="number"
                        value={editingEntry.pis || ""}
                        onChange={(e) => setEditingEntry({ ...editingEntry, pis: parseFloat(e.target.value) || 0 })}
                        className="rounded-xl h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-bold text-slate-700">COFINS (%)</Label>
                      <Input
                        type="number"
                        value={editingEntry.cofins || ""}
                        onChange={(e) => setEditingEntry({ ...editingEntry, cofins: parseFloat(e.target.value) || 0 })}
                        className="rounded-xl h-12"
                      />
                    </div>
                  </div>
                </div>
              )}

              <DialogFooter className="gap-3">
                <Button
                  variant="ghost"
                  onClick={() => setIsEditing(false)}
                  className="rounded-xl font-bold"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSaveEdit}
                  className="bg-red-600 hover:bg-red-700 rounded-xl font-bold h-12 px-8"
                >
                  Salvar Alterações
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </PageTransition>
    
  );
};

export default AdminNcmManagement;