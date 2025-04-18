
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";

export function LoginDialog() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const { login, isAuthenticated, logout } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(username, password);
      setIsOpen(false);
      setUsername("");
      setPassword("");
    } catch (error) {
      // Error is handled in the login function
    }
  };

  if (isAuthenticated) {
    return (
      <Button variant="outline" onClick={logout}>
        Sair
      </Button>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Login Administrador</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Login Administrador</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Input
              placeholder="Usuário"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-gray-800 border-gray-700"
            />
          </div>
          <div>
            <Input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-gray-800 border-gray-700"
            />
          </div>
          <Button type="submit" className="w-full">
            Entrar
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
