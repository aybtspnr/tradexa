"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Badge 
} from '@/components/ui/badge';
import { 
  CheckCircle, 
  XCircle, 
  Edit, 
  UserPlus, 
  Search,
  Loader2,
  Database,
  Shield,
  Users,
  TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { PageTransition } from '@/components/premium';
import { motion } from 'framer-motion';

const Admin = () => {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProfiles(data || []);
    } catch (error: any) {
      toast.error('Erro ao carregar perfis: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateProfileStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
      
      toast.success(`Perfil ${newStatus === 'approved' ? 'aprovado' : 'rejeitado'} com sucesso!`);
      fetchProfiles();
    } catch (error: any) {
      toast.error('Erro ao atualizar status: ' + error.message);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProfile) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          company_name: selectedProfile.company_name,
          cnpj: selectedProfile.cnpj,
          status: selectedProfile.status,
          role: selectedProfile.role,
        })
        .eq('id', selectedProfile.id);

      if (error) throw error;
      
      toast.success('Perfil atualizado com sucesso!');
      setIsEditing(false);
      fetchProfiles();
    } catch (error: any) {
      toast.error('Erro ao salvar perfil: ' + error.message);
    }
  };

  const filteredProfiles = profiles.filter(p => 
    p.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.cnpj?.includes(searchTerm)
  );

  const pendingProfiles = filteredProfiles.filter(p => p.status === 'pending');
  const approvedProfiles = filteredProfiles.filter(p => p.status === 'approved');

  return (
    <DashboardLayout title="Administração">
      <PageTransition>
        <div className="space-y-8">
          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="border-none shadow-lg rounded-[2.5rem] overflow-hidden cursor-pointer hover:shadow-xl transition-shadow" onClick={() => navigate('/admin/ncm')}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <Database className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-slate-900">Gestão de Base NCM</h3>
                        <p className="text-sm text-slate-500 font-medium">Importar e gerenciar códigos NCM</p>
                      </div>
                    </div>
                    <Badge className="bg-red-100 text-red-700 border-none text-[9px] font-black uppercase">
                      Novo
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="border-none shadow-lg rounded-[2.5rem] overflow-hidden cursor-pointer hover:shadow-xl transition-shadow" onClick={() => navigate('/admin')}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <Users className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-slate-900">Gestão de Usuários</h3>
                        <p className="text-sm text-slate-500 font-medium">Aprovar e gerenciar usuários</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <div className="relative w-full sm:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                  placeholder="Buscar empresa, email ou CNPJ..." 
                  className="pl-10 rounded-xl"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </motion.div>

          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-md mb-6 rounded-xl">
              <TabsTrigger value="pending" className="rounded-lg">
                Pendentes <Badge variant="secondary" className="ml-2 bg-amber-100 text-amber-700">{pendingProfiles.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="approved" className="rounded-lg">
                Aprovados <Badge variant="secondary" className="ml-2 bg-green-100 text-green-700">{approvedProfiles.length}</Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <Table>
                  <TableHeader className="bg-slate-50/50">
                    <TableRow>
                      <TableHead className="font-bold text-slate-600">Empresa / Email</TableHead>
                      <TableHead className="font-bold text-slate-600">Papel</TableHead>
                      <TableHead className="font-bold text-slate-600">CNPJ</TableHead>
                      <TableHead className="text-right font-bold text-slate-600">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={4} className="h-32 text-center">
                          <Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-400" />
                        </TableCell>
                      </TableRow>
                    ) : pendingProfiles.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="h-32 text-center text-slate-400">
                          Nenhum cadastro pendente no momento.
                        </TableCell>
                      </TableRow>
                    ) : (
                      pendingProfiles.map((profile) => (
                        <TableRow key={profile.id} className="hover:bg-slate-50/50 transition-colors">
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-900">{profile.company_name}</span>
                              <span className="text-xs text-slate-500">{profile.email}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize font-bold text-slate-600">
                              {profile.role}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-xs text-slate-500">
                            {profile.cnpj}
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-blue-600 hover:bg-blue-50 rounded-lg"
                              onClick={() => {
                                setSelectedProfile({...profile});
                                setIsEditing(true);
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-green-600 hover:bg-green-50 rounded-lg"
                              onClick={() => updateProfileStatus(profile.id, 'approved')}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-red-600 hover:bg-red-50 rounded-lg"
                              onClick={() => updateProfileStatus(profile.id, 'rejected')}
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="approved">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <Table>
                  <TableHeader className="bg-slate-50/50">
                    <TableRow>
                      <TableHead className="font-bold text-slate-600">Empresa / Email</TableHead>
                      <TableHead className="font-bold text-slate-600">Papel</TableHead>
                      <TableHead className="font-bold text-slate-600">CNPJ</TableHead>
                      <TableHead className="text-right font-bold text-slate-600">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={4} className="h-32 text-center">
                          <Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-400" />
                        </TableCell>
                      </TableRow>
                    ) : approvedProfiles.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="h-32 text-center text-slate-400">
                          Nenhum perfil aprovado encontrado.
                        </TableCell>
                      </TableRow>
                    ) : (
                      approvedProfiles.map((profile) => (
                        <TableRow key={profile.id} className="hover:bg-slate-50/50 transition-colors">
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-900">{profile.company_name}</span>
                              <span className="text-xs text-slate-500">{profile.email}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize font-bold text-slate-600">
                              {profile.role}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-xs text-slate-500">
                            {profile.cnpj}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-blue-600 hover:bg-blue-50 rounded-lg"
                              onClick={() => {
                                setSelectedProfile({...profile});
                                setIsEditing(true);
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>

          <Dialog open={isEditing} onOpenChange={(open) => {
            setIsEditing(open);
            if (!open) setSelectedProfile(null);
          }}>
            <DialogContent className="sm:max-w-[425px] rounded-2xl">
              <DialogHeader>
                <DialogTitle className="font-black text-slate-900">Editar Perfil</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSaveProfile} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nome da Empresa</Label>
                  <Input 
                    value={selectedProfile?.company_name || ''} 
                    onChange={(e) => setSelectedProfile({...selectedProfile, company_name: e.target.value})}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">CNPJ</Label>
                  <Input 
                    value={selectedProfile?.cnpj || ''} 
                    onChange={(e) => setSelectedProfile({...selectedProfile, cnpj: e.target.value})}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Papel (Role)</Label>
                  <Input 
                    value={selectedProfile?.role || ''} 
                    onChange={(e) => setSelectedProfile({...selectedProfile, role: e.target.value})}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status</Label>
                  <Input 
                    value={selectedProfile?.status || ''} 
                    onChange={(e) => setSelectedProfile({...selectedProfile, status: e.target.value})}
                    className="rounded-xl"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={() => setIsEditing(false)}
                    className="rounded-xl font-bold"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold px-6"
                  >
                    Salvar Alterações
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </PageTransition>
    </DashboardLayout>
  );
};

export default Admin;