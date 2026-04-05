import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const defaultPassword = await bcrypt.hash('123456', 10);

  const users = [
    { email: 'admin@escola.edu.br', name: 'Admin Escola', role: 'ADMIN' as const, status: 'ativo' },
    { email: 'maria@escola.edu.br', name: 'Maria Silva', role: 'PROFESSOR' as const, status: 'ativo' },
    { email: 'joao@escola.edu.br', name: 'João Santos', role: 'PROFESSOR' as const, status: 'ativo' },
    { email: 'ana@escola.edu.br', name: 'Ana Costa', role: 'PROFESSOR' as const, status: 'ativo' },
    { email: 'carlos@escola.edu.br', name: 'Carlos Lima', role: 'PROFESSOR' as const, status: 'inativo' },
    { email: 'tech@escola.edu.br', name: 'Tech Support', role: 'TECNICO' as const, status: 'ativo' },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: { name: user.name, role: user.role, status: user.status, password: defaultPassword, mustChangePassword: true },
      create: { ...user, password: defaultPassword, mustChangePassword: true },
    });
    console.log(`✅ ${user.name} (${user.email}) — ${user.role}`);
  }

  console.log('\n🎓 Seed concluído! Senha padrão para todos: 123456');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
