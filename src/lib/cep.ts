// Consulta de CEP via ViaCEP, reutilizável por formulários (perfil, anúncio).
export interface CepAddress {
  street: string;
  neighborhood: string;
  city: string;
  state: string;
}

// Retorna o endereço do CEP ou null (CEP inexistente, formato inválido ou erro de rede).
export async function lookupCep(cep: string): Promise<CepAddress | null> {
  const clean = cep.replace(/\D/g, "");
  if (clean.length !== 8) return null;
  try {
    const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.erro) return null;
    return {
      street: data.logradouro || "",
      neighborhood: data.bairro || "",
      city: data.localidade || "",
      state: data.uf || "",
    };
  } catch {
    return null;
  }
}
