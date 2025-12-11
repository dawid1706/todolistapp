import { useState } from "react";

export interface RegisterFormData {
  name: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface UserResponse {
  _id: string;
  name: string;
  lastName: string;
  email: string;
}

interface RegisterResponse {
  status: string;
  token: string;
  user: UserResponse;
}

export const useRegister = () => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const register = async (formData: RegisterFormData): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:3001/api/user/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const json = await response.json();

      if (!response.ok) {
        setError(json.message || "Rejestracja nie powiodła się");
        return false;
      }

      const data = json as RegisterResponse;

      localStorage.setItem("token", data.token);

      const userToSave = {
        ...data.user,
        id: data.user._id,
      };

      localStorage.setItem("user", JSON.stringify(userToSave));

      return true;
    } catch (err) {
      console.error(err);
      setError("Błąd połączenia z serwerem");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { register, isLoading, error };
};
