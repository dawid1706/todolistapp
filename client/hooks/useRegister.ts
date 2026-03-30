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

  const register = async (
    formData: RegisterFormData
  ): Promise<RegisterResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        "https://todolistapp-371334652902.europe-west1.run.app/api/user/signup",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const json = await response.json();

      if (!response.ok) {
        setError(json.message || "Rejestracja nie powiodła się");
        return null;
      }

      const data = json as RegisterResponse;

      const sessionData = {
        ...data,
        user: {
          ...data.user,
          id: data.user._id, // Map _id to id
        },
      };

      localStorage.setItem("session", JSON.stringify(sessionData));

      return sessionData;
    } catch (err) {
      console.error(err);
      setError("Błąd połączenia z serwerem");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { register, isLoading, error };
};
