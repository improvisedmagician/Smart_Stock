export class DeleteProductUseCase {
  constructor(private productRepo: any) {}
  async execute(id: string) {
    const product = await this.productRepo.findById(id);
    if (!product) throw new Error('Produto nuo encontrado');
    await this.productRepo.delete(id);
  }
}
