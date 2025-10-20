import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Trash2, RotateCcw, Trash, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

const API_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000/api";

export default function TrashView() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const { toast } = useToast();

  const fetchTrash = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast({
          title: "Authentification requise",
          description: "Veuillez vous reconnecter pour accéder à la corbeille.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const res = await fetch(`${API_URL}/trash`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          toast({
            title: "Session expirée",
            description: "Votre session a expiré. Veuillez vous reconnecter.",
            variant: "destructive",
          });
          localStorage.removeItem("token");
        } else {
          toast({
            title: "Erreur",
            description: `Erreur ${res.status} lors du chargement.`,
            variant: "destructive",
          });
        }
        setItems([]);
        return;
      }

      const data = await res.json();
      setItems(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      console.error(err);
      toast({
        title: "Erreur",
        description: "Impossible de charger la corbeille.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrash();
  }, []);

  const handleRestore = async (id: number, entity: string) => {
  setBusyId(id);
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/trash/${entity}/${id}/restore`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) throw new Error("Erreur restauration");
    toast({ title: "Élément restauré", description: "L’élément a été restauré avec succès." });
    fetchTrash();
  } catch {
    toast({ title: "Erreur", description: "Échec de la restauration.", variant: "destructive" });
  } finally {
    setBusyId(null);
  }
};


  const handleDelete = async (id: number) => {
    setBusyId(id);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/trash/${id}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Erreur suppression");

      toast({
        title: "Élément supprimé",
        description: "L’élément a été définitivement supprimé.",
      });
      fetchTrash();
    } catch {
      toast({
        title: "Erreur",
        description: "Échec de la suppression.",
        variant: "destructive",
      });
    } finally {
      setBusyId(null);
    }
  };

  const handleEmpty = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/trash/empty/all`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Erreur vidage");

      toast({
        title: "Corbeille vidée",
        description: "Tous les éléments ont été supprimés.",
      });
      fetchTrash();
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible de vider la corbeille.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Trash2 className="w-5 h-5 text-destructive" /> Corbeille
        </CardTitle>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" disabled={loading}>
              <Trash className="w-4 h-4 mr-1" /> Vider la corbeille
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmer le vidage</AlertDialogTitle>
              <AlertDialogDescription>
                Cette action supprimera <b>définitivement</b> tous les éléments de la corbeille.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleEmpty}
                className="bg-[#235F8F] hover:bg-[#1c4d73] text-white"
              >
                Vider
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="animate-spin w-6 h-6 text-muted-foreground" />
          </div>
        ) : items.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Aucun élément dans la corbeille.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Titre</TableHead>
                <TableHead>Supprimé par</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.id}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {item.entity === "contact_messages"
                        ? "Message"
                        : item.entity === "formations"
                        ? "Formation"
                        : item.entity === "demandes_devis"
                        ? "Demande de devis"
                        : item.entity || "—"}
                    </Badge>
                  </TableCell>
                  <TableCell>{item.title || "—"}</TableCell>
                  <TableCell>{item.deleted_by || "Inconnu"}</TableCell>
                  <TableCell>
                    {new Date(item.created_at).toLocaleDateString("fr-FR")}
                  </TableCell>
                  <TableCell className="text-right flex gap-2 justify-end">
                   <Button
  size="sm"
  variant="secondary"
  onClick={() => handleRestore(item.id, item.entity)}
  disabled={busyId === item.id}
>
                      {busyId === item.id ? (
                        <Loader2 className="animate-spin w-4 h-4" />
                      ) : (
                        <RotateCcw className="w-4 h-4" />
                      )}
                      Restaurer
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(item.id)}
                      disabled={busyId === item.id}
                    >
                      {busyId === item.id ? (
                        <Loader2 className="animate-spin w-4 h-4" />
                      ) : (
                        <Trash className="w-4 h-4" />
                      )}
                      Supprimer
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
