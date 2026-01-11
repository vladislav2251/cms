const { PrismaClient } = require('@prisma/client');

async function main() {
  console.log('1. Пытаюсь создать PrismaClient...');
  try {
    const prisma = new PrismaClient();
    console.log('2. Клиент создан успешно!');
    
    console.log('3. Пытаюсь подключиться...');
    await prisma.$connect();
    console.log('4. ПОДКЛЮЧЕНИЕ УСПЕШНО! ✅'); // Если увидишь это — база работает
    
    await prisma.$disconnect();
  } catch (e) {
    console.error('❌ ОШИБКА:', e);
  }
}

main();