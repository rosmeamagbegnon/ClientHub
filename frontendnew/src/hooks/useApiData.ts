/**
 * Hook React générique pour gérer les données API
 *
 * PRINCIPE DRY (Don't Repeat Yourself) :
 * Ce hook centralise la gestion des états loading, error, data
 * pour éviter la duplication de code dans tous les composants.
 *
 * Avantages :
 * - Code réutilisable
 * - Gestion d'erreur uniforme
 * - États de chargement cohérents
 * - Facile à maintenir
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { logger } from "../utils/logger";

/**
 * État d'une requête API
 */
export interface ApiDataState<T> {
  /** Données récupérées */
  data: T | null;
  /** Si true, la requête est en cours */
  loading: boolean;
  /** Message d'erreur (null si pas d'erreur) */
  error: string | null;
  /** Fonction pour recharger les données */
  refetch: () => Promise<void>;
}

/**
 * Options pour le hook useApiData
 */
export interface UseApiDataOptions {
  /** Si true, charge les données automatiquement au montage (défaut: true) */
  autoFetch?: boolean;
  /** Message d'erreur personnalisé */
  errorMessage?: string;
}

/**
 * Hook générique pour gérer les données API
 *
 * @param fetchFn - Fonction qui retourne une Promise avec les données
 * @param options - Options de configuration
 * @returns État de la requête (data, loading, error, refetch)
 *
 * @example
 * const { data, loading, error, refetch } = useApiData(
 *   () => ticketService.listTickets({ page: 1, limit: 10 })
 * );
 */
export function useApiData<T>(
  fetchFn: () => Promise<T>,
  options: UseApiDataOptions = {}
): ApiDataState<T> {
  const {
    autoFetch = true,
    errorMessage = "Erreur lors du chargement des données",
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(autoFetch);
  const [error, setError] = useState<string | null>(null);

  // Utiliser useRef pour stocker la fonction et éviter les re-créations
  const fetchFnRef = useRef(fetchFn);
  const errorMessageRef = useRef(errorMessage);

  // Mettre à jour les refs à chaque changement
  useEffect(() => {
    fetchFnRef.current = fetchFn;
    errorMessageRef.current = errorMessage;
  }, [fetchFn, errorMessage]);

  // Flags pour éviter les appels multiples
  const isFetchingRef = useRef(false);
  const hasFetchedRef = useRef(false);

  const fetchData = useCallback(async () => {
    // Éviter les appels multiples simultanés
    if (isFetchingRef.current) {
      logger.debug("Requête déjà en cours, ignorée");
      return;
    }

    isFetchingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const result = await fetchFnRef.current();
      setData(result);
      hasFetchedRef.current = true;
      logger.debug("Données récupérées avec succès", {
        dataType: typeof result,
      });
    } catch (err: any) {
      const errorMsg = err?.message || errorMessageRef.current;
      setError(errorMsg);
      logger.error("Erreur lors de la récupération des données", err);
      setData(null);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, []); // Pas de dépendances, utilise les refs

  useEffect(() => {
    // Ne faire qu'un seul appel automatique au montage
    if (autoFetch && !hasFetchedRef.current && !isFetchingRef.current) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoFetch]); // Seulement autoFetch comme dépendance

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}

/**
 * Hook pour gérer les mutations (POST, PUT, PATCH, DELETE)
 *
 * @param mutationFn - Fonction qui effectue la mutation
 * @returns Fonction de mutation avec gestion d'erreur
 *
 * @example
 * const createTicket = useApiMutation(
 *   (data) => ticketService.createTicket(data)
 * );
 *
 * const handleSubmit = async () => {
 *   try {
 *     const result = await createTicket(ticketData);
 *     // Succès
 *   } catch (error) {
 *     // Erreur gérée automatiquement
 *   }
 * };
 */
export function useApiMutation<TData, TVariables = void>(
  mutationFn: (variables: TVariables) => Promise<TData>
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(
    async (variables: TVariables): Promise<TData> => {
      setLoading(true);
      setError(null);

      try {
        const result = await mutationFn(variables);
        logger.debug("Mutation réussie", { dataType: typeof result });
        return result;
      } catch (err: any) {
        const errorMsg = err?.message || "Erreur lors de l'opération";
        setError(errorMsg);
        logger.error("Erreur lors de la mutation", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [mutationFn]
  );

  return {
    mutate,
    loading,
    error,
  };
}
