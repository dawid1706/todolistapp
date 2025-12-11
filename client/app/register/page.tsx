import type React from "react";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileText, UserPlus } from "lucide-react";
import { useAuth } from "@/components/auth-provider"; // Import useAuth
import { useRegister } from "@/hooks/useRegister";

export default function RegisterPage() {
  // Stan formularza
  const [fullName, setFullName] = useState(""); // Jedno pole dla usera
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Lokalny błąd walidacji
  const [validationError, setValidationError] = useState("");

  const navigate = useNavigate();
  const { setSession } = useAuth(); // Pobierz setSession z kontekstu

  // Pobieramy stan i funkcję z hooka
  const { register, isLoading, error: apiError } = useRegister();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    if (password !== confirmPassword) {
      setValidationError("Hasła nie są zgodne");
      return;
    }

    const nameParts = fullName.trim().split(" ");
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

    const sessionData = await register({
      name: firstName,
      lastName: lastName,
      email,
      password,
      confirmPassword,
    });

    if (sessionData) {
      setSession(sessionData); // Ustaw sesję w stanie globalnym
      navigate("/dashboard"); // Przekieruj do dashboardu
    }
  };

  // Wybieramy błąd do wyświetlenia
  const displayError = validationError || apiError;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="h-12 w-12 bg-primary rounded-lg flex items-center justify-center">
              <FileText className="h-6 w-6 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-balance">Invoice Manager</h1>
          <p className="text-muted-foreground mt-2">
            Bezpieczne zarządzanie fakturami
          </p>
        </div>

        <Card className="border-border">
          <CardHeader>
            <CardTitle>Rejestracja</CardTitle>
            <CardDescription>Utwórz nowe konto</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {displayError && (
                <Alert variant="destructive">
                  <AlertDescription>{displayError}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">Imię i nazwisko</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Jan Kowalski"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Adres e-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="twoj@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Hasło</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground">Min. 8 znaków</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Potwierdź hasło</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <UserPlus className="mr-2 h-4 w-4 animate-pulse" />
                    Tworzenie konta...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Zarejestruj się
                  </>
                )}
              </Button>

              <div className="text-sm text-center text-muted-foreground">
                Masz już konto?{" "}
                <Link to="/login" className="text-primary hover:underline">
                  Zaloguj się
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
