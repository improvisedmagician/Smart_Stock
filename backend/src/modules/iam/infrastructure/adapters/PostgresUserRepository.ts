import { Pool } from "pg";
import { UserRepositoryPort } from "../../domain/ports/UserRepository.port";
import { User } from "../../domain/entities/User";

export class PostgresUserRepository implements UserRepositoryPort {
  constructor(private pool: Pool) {}
  async findByEmail(email: string): Promise<User | null> {
    const result = await this.pool.query("SELECT id_usuario, nome, email, senha_hash, perfil, data_criacao FROM Usuario WHERE email = $1", [email]);
    if (result.rows.length === 0) return null;
    return this.mapToUser(result.rows[0]);
  }
  async findById(id: string): Promise<User | null> {
    const result = await this.pool.query("SELECT id_usuario, nome, email, senha_hash, perfil, data_criacao FROM Usuario WHERE id_usuario = $1", [id]);
    if (result.rows.length === 0) return null;
    return this.mapToUser(result.rows[0]);
  }
  async findAll(): Promise<Omit<User, 'passwordHash'>[]> {
    const result = await this.pool.query("SELECT id_usuario, nome, email, perfil, data_criacao FROM Usuario ORDER BY data_criacao DESC");
    return result.rows.map(row => ({
      id: row.id_usuario,
      name: row.nome,
      email: row.email,
      role: row.perfil,
      active: true,
      createdAt: row.data_criacao,
      updatedAt: row.data_criacao
    }));
  }
  async save(user: User): Promise<User> {
    const result = await this.pool.query(
      "INSERT INTO Usuario (id_usuario, nome, email, senha_hash, perfil, data_criacao) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (email) DO UPDATE SET nome = EXCLUDED.nome, senha_hash = EXCLUDED.senha_hash, perfil = EXCLUDED.perfil RETURNING id_usuario, nome, email, senha_hash, perfil, data_criacao",
      [user.id, user.name, user.email, user.passwordHash, user.role, user.createdAt]
    );
    return this.mapToUser(result.rows[0]);
  }
  private mapToUser(row: any): User {
    return {
      id: row.id_usuario, name: row.nome, email: row.email, passwordHash: row.senha_hash,
      role: row.perfil, active: true, createdAt: row.data_criacao, updatedAt: row.data_criacao
    };
  }
}
