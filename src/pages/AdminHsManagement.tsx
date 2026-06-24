"use client";

import { useState, useRef, useEffect } from "react";
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

interface HsEntry {
  code: string;
  description: string;
  chapter?: string;
  heading?: string;
  subheading?: string;
}

interface HsRecord {
  id: string;
  code: string;
  description: string;
  chapter?: string | null;
  heading?: string | null;
  subheading?: string | null;
  created_at: string;
}

const AdminHsManagement = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [hsData, setHsData] = useState<HsRecord[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<HsEntry[]>([]);
  const [editingEntry, setEditingEntry] = useState<HsRecord | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchHsData();
  }, []);

  const fetchHsData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("hs_codes")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      setHsData(data || []);
      
      const { count } = await supabase
        .from("hs_codes")
        .select("*", { count: "exact", head: true });
      
      setTotalCount(count || 0);
    } catch (error: any) {
      showError("Erro ao carregar dados: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const normalizeHsEntry = (entry: any): HsEntry | null => {
    // Suporta múltiplos formatos de campo
    const code = entry.code || entry.hs || entry.codigo || entry.hs_code;
    const description = entry.description || entry.descricao || entry.desc || entry.descricao_pt || entry.label || entry.search_text;
    const chapter = entry.chapter || entry.sh4 || entry.sh2 || entry.cap;
    const heading = entry.heading || entry.sh6 || entry.heading_code;
    const subheading = entry.subheading || entry.sh8 || entry.subheading_code;
    
    if (!code || !description) {
      return null;
    }

    return {
      code: String(code).replace(/\D/g, ""),
      description: String(description),
      chapter: chapter ? String(chapter).replace(/\D/g, "") : null,
      heading: heading ? String(heading).replace(/\D/g, "") : null,
      subheading: subheading ? String(subheading).replace(/\D/g, "") : null,
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
        throw new Error("O arquivo JSON deve conter um array de entradas HS.");
      }

      const normalizedEntries: HsEntry[] = [];
      const invalidEntries: number[] = [];

      jsonData.forEach((entry, index) => {
        const normalized = normalizeHsEntry(entry);
        if (normalized) {
          normalizedEntries.push(normalized);
        } else {
          invalidEntries.push(index + 1);
        }
      });

      if (invalidEntries.length > 0) {
        throw new Error(
          `${invalidEntries.length} entradas inválidas nas posições: ${invalidEntries.slice(0, 5).join(', ')}${invalidEntries.length > 5 ? '...' : ''}. ` +
          `Cada entrada deve ter 'code'/'hs'/'label' E 'description'/'descricao'/'label'/'search_text'.`
        );
      }

      if (normalizedEntries.length === 0) {
        throw new Error("Nenhuma entrada válida encontrada no arquivo JSON.");
      }

      setPreviewData(normalizedEntries.slice(0, 10));
      setShowPreview(true);
      (fileInputRef.current as any)._fullData = normalizedEntries;
      
      showSuccess(`${normalizedEntries.length} entradas HS válidas encontradas!`);
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
    const jsonData: HsEntry[] = (fileInputRef.current as any)?._fullData || [];
    
    if (jsonData.length === 0) {
      showError("Nenhum dado para importar.");
      return;
    }

    setUploading(true);
    try {
      const batchSize = 100;
      let successCount = 0;

      for (let i = 0; i < jsonData.length; i += batchSize) {
        const batch = jsonData.slice(i, i + batchSize);
        
        const upsertData = batch.map((entry) => ({
          code: entry.code,
          description: entry.description,
          chapter: entry.chapter || null,
          heading: entry.heading || null,
          subheading: entry.subheading || null,
        }));

        const { data: insertedData, error: insertError } = await supabase
          .from("hs_codes")
          .upsert(upsertData, { onConflict: "code" })
          .select();

        if (insertError) {
          console.error("Insert error:", insertError);
          throw insertError;
        }
        
        successCount += insertedData?.length || 0;
      }

      showSuccess(`${successCount} códigos HS importados com sucesso!`);
      setShowPreview(false);
      fetchHsData();
    } catch (error: any) {
      showError("Erro ao importar: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este código HS?")) return;

    try {
      const { error } = await supabase
        .from("hs_codes")
        .delete()
        .eq("id", id);

      if (error) throw error;

      showSuccess("Código HS excluído!");
      fetchHsData();
    } catch (error: any) {
      showError("Erro ao excluir: " + error.message);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingEntry) return;

    try {
      const { error } = await supabase
        .from("hs_codes")
        .update({
          code: editingEntry.code.replace(/\D/g, ""),
          description: editingEntry.description,
          chapter: editingEntry.chapter || null,
          heading: editingEntry.heading || null,
          subheading: editingEntry.subheading || null,
        })
        .eq("id", editingEntry.id);

      if (error) throw error;

      showSuccess("Código HS atualizado!");
      setIsEditing(false);
      setEditingEntry(null);
      fetchHsData();
    } catch (error: any) {
      showError("Erro ao atualizar: " + error.message);
    }
  };

  const handleDownloadTemplate = () => {
    const template: any[] = [
      {
        code: "0101210000",
        sh4: "0101",
        label: "Pure-bred breeding animals",
        search_text: "Live horses, asses, mules and hinnies > Horses > Pure-bred breeding animals"
      },
      {
        code: "8517120000",
        sh4: "8517",
        label: "Telefones para redes celulares",
        search_text: "Aparelhos telefônicos > Telefones celulares"
      },
    ];

    const blob = new Blob([JSON.stringify(template, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "template-hs.json";
    link.click();
    showSuccess("Template baixado!");
  };

  const filteredData = hsData.filter(
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
                    <p className="text-[10px] font-black text-green-100 uppercase tracking-widest">Com Capítulo</p>
                    <p className="text-4xl font-black mt-2">
                      {hsData.filter((n) => n.chapter).length}
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
                      {hsData[0]?.created_at
                        ? new Date(hsData[0].created_at).toLocaleDateString("pt-BR")
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
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Upload className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">Importar Base HS</h3>
                  <p className="text-sm text-slate-600 font-medium">Upload de arquivo JSON com códigos e descrições HS</p>
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
                      <li>• code, hs, codigo, hs_code</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-bold text-blue-900 mb-2">Descrição:</p>
                    <ul className="space-y-1 text-blue-700">
                      <li>• description, descricao, desc, label, search_text</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-bold text-blue-900 mb-2">Capítulo:</p>
                    <ul className="space-y-1 text-blue-700">
                      <li>• chapter, sh4, sh2, cap</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-bold text-blue-900 mb-2">Heading:</p>
                    <ul className="space-y-1 text-blue-700">
                      <li>• heading, sh6, heading_code</li>
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
                    id="hs-upload"
                  />
                  <Label
                    htmlFor="hs-upload"
                    className="flex items-center gap-3 px-6 py-4 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300 cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all"
                  >
                    <FileJson className="w-8 h-8 text-slate-600" />
                    <div className="text-left">
                      <p className="font-bold text-slate-700">Selecionar arquivo JSON</p>
                      <p className="text-xs text-slate-600">Aceita: code/hs/label + description/label/search_text</p>
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
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
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
                    <h3 className="text-xl font-black text-slate-900">Códigos HS Cadastrados</h3>
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
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
              ) : (
                <div className="rounded-xl border border-slate-200 overflow-hidden">
                  <Table>
                    <TableHeader className="bg-slate-50">
                      <TableRow>
                        <TableHead className="font-bold w-[150px]">Código HS</TableHead>
                        <TableHead className="font-bold">Descrição</TableHead>
                        <TableHead className="font-bold w-[100px]">Capítulo</TableHead>
                        <TableHead className="font-bold w-[100px]">Heading</TableHead>
                        <TableHead className="font-bold w-[150px] text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredData.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="h-32 text-center text-slate-600">
                            {searchTerm ? "Nenhum código encontrado." : "Nenhum código cadastrado. Importe um arquivo JSON."}
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredData.slice(0, 50).map((item) => (
                          <TableRow key={item.id} className="hover:bg-slate-50">
                            <TableCell className="font-mono font-bold text-blue-600">{item.code}</TableCell>
                            <TableCell className="text-sm text-slate-700">{item.description}</TableCell>
                            <TableCell className="text-sm text-center">{item.chapter || "—"}</TableCell>
                            <TableCell className="text-sm text-center">{item.heading || "—"}</TableCell>
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
                        <TableHead className="font-bold">Capítulo</TableHead>
                        <TableHead className="font-bold">Heading</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {previewData.map((item, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-mono font-bold text-blue-600">{item.code}</TableCell>
                          <TableCell className="text-sm">{item.description}</TableCell>
                          <TableCell className="text-sm">{item.chapter || "—"}</TableCell>
                          <TableCell className="text-sm">{item.heading || "—"}</TableCell>
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
                  className="bg-blue-600 hover:bg-blue-700 rounded-xl font-bold h-12 px-8 gap-2"
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
                <DialogTitle className="font-black text-xl">Editar Código HS</DialogTitle>
              </DialogHeader>

              {editingEntry && (
                <div className="space-y-6 py-6">
                  <div className="space-y-2">
                    <Label className="font-bold text-slate-700">Código HS</Label>
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
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="font-bold text-slate-700">Capítulo</Label>
                      <Input
                        value={editingEntry.chapter || ""}
                        onChange={(e) => setEditingEntry({ ...editingEntry, chapter: e.target.value })}
                        className="rounded-xl h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-bold text-slate-700">Heading</Label>
                      <Input
                        value={editingEntry.heading || ""}
                        onChange={(e) => setEditingEntry({ ...editingEntry, heading: e.target.value })}
                        className="rounded-xl h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-bold text-slate-700">Subheading</Label>
                      <Input
                        value={editingEntry.subheading || ""}
                        onChange={(e) => setEditingEntry({ ...editingEntry, subheading: e.target.value })}
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
                  className="bg-blue-600 hover:bg-blue-700 rounded-xl font-bold h-12 px-8"
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

export default AdminHsManagement;