export interface IUnitOfWork {
  executar<T>(fn: (tx: unknown) => Promise<T>): Promise<T>;
}
