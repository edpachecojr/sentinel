/**
 * Interface base para ViewModels
 *
 * Um ViewModel é o objeto retornado por handlers de casos de uso.
 * Contém dados já formatados para exibição (strings prontas, dados normalizados).
 *
 * Convenção de nomenclatura:
 * - ViewModels ficam em: src/core/casosDeUso/{dominio}/viewModels/{NomeViewModel}.ts
 * - Campos formatados têm sufixo "Formatado": valorFormatado, dataFormatada, etc.
 * - Handlers sempre retornam ViewModels, nunca objetos Prisma brutos
 *
 * @example
 * interface FreteListViewModel extends IViewModel {
 *   readonly id: string;
 *   readonly origem: string;
 *   readonly destino: string;
 *   readonly valorFormatado: string;    // ← campo formatado (de formatBRL)
 *   readonly dataFormatada: string;     // ← campo formatado (de formatDate)
 *   readonly distanciaKm: number;       // ← número puro, sem formatação
 * }
 */
export interface IViewModel {
  readonly _type?: string;
}
