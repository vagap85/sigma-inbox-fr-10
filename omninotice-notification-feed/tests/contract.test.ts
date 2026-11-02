import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const SRC_DIR = path.resolve(__dirname, '../src');
const EXCLUDE_DIRS = ['mock', 'scripts', 'app'];

function getAllFiles(dir: string, ext: string[]): string[] {
  let results: string[] = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.resolve(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      if (!EXCLUDE_DIRS.includes(file)) {
        results = results.concat(getAllFiles(filePath, ext));
      }
    } else {
      if (ext.some((e) => filePath.endsWith(e))) {
        results.push(filePath);
      }
    }
  }
  return results;
}

const tsFiles = getAllFiles(SRC_DIR, ['.ts', '.tsx']);

describe('Контракт: Запреты (§5)', () => {
  it('§5.1 Не использует fetch, axios или XMLHttpRequest напрямую', () => {
    const filesToCheck = tsFiles.filter((f) => !f.endsWith('apiFetch.ts'));
    for (const file of filesToCheck) {
      const content = fs.readFileSync(file, 'utf-8');
      expect(content, `Нарушение в ${path.relative(SRC_DIR, file)}`).not.toMatch(/\bfetch\s*\(/);
      expect(content).not.toContain('axios');
      expect(content).not.toContain('XMLHttpRequest');
    }
  });

  it('§5.1 Не использует localStorage, sessionStorage или document.cookie', () => {
    for (const file of tsFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      expect(content).not.toContain('localStorage');
      expect(content).not.toContain('sessionStorage');
      expect(content).not.toContain('document.cookie');
    }
  });

  it('§5.2 Не управляет навигацией напрямую', () => {
    for (const file of tsFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      expect(content).not.toMatch(/window\.location\.(href|assign|replace)/);
      expect(content).not.toContain('history.pushState');
      expect(content).not.toContain('useNavigate');
    }
  });

  it('§5.4 Нет legacy-алиасов @/* и импортов из внутренних файлов @core', () => {
    for (const file of tsFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      expect(content).not.toMatch(/from\s+['"]@\/(?!core)/);
            // Запрет на импорты из внутренних файлов чужих слоёв
      // Разрешены только публичные API: @core/hive, @core/hive/react, @core/data, @core/actions, @core/theme, @core/i18n, @core/security
      const ALLOWED_CORE_SUBPATHS = [
        '@core/hive/react',
        '@core/ui/react',
        '@core/theme',
        '@core/i18n',
        '@core/security',
      ];
      const coreImports = [...content.matchAll(/from\s+['"](@core\/[^'"]+)['"]/g)].map(m => m[1]);
      for (const imp of coreImports) {
        const isRootCore = imp.split('/').length === 2; // @core/data
        const isAllowedSub = ALLOWED_CORE_SUBPATHS.includes(imp);
        expect(isRootCore || isAllowedSub, `Недопустимый импорт ${imp} в ${path.relative(SRC_DIR, file)}`).toBe(true);
      }
    }
  });

  it('§5.6 Не использует @core/tessera или @core/honeycomb напрямую', () => {
    for (const file of tsFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      expect(content).not.toContain('@core/tessera');
      expect(content).not.toContain('@core/honeycomb');
    }
  });

  it('§5.13 Не использует Redux, js-cookie или react-helmet-async', () => {
    for (const file of tsFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      expect(content).not.toContain('react-redux');
      expect(content).not.toContain('js-cookie');
      expect(content).not.toContain('react-helmet-async');
    }
  });
});

describe('Контракт: Обязательные требования (§3)', () => {
  it('§3.2 Компонент зарегистрирован как "notifications"', () => {
    const registerAll = fs.readFileSync(path.resolve(SRC_DIR, 'register-all.ts'), 'utf-8');
    expect(registerAll).toContain('registerSlotComponent("notifications"');
  });

  it('§3.4 Использует callProvider для данных', () => {
    const requestsFile = fs.readFileSync(path.resolve(SRC_DIR, 'api/requests.ts'), 'utf-8');
    expect(requestsFile).toContain('notifications.doocot.list');
    expect(requestsFile).toContain('notifications.doocot.counts');
    expect(requestsFile).toContain('notifications.doocot.details');
  });

  it('§3.6 Действия — это данные, а не функции', () => {
    const actionsFile = fs.readFileSync(path.resolve(SRC_DIR, 'api/actions.ts'), 'utf-8');
    expect(actionsFile).toContain('type: "mark-read"');
    expect(actionsFile).not.toMatch(/onClick\s*:/);
  });

    it('§3.3 В CSS-модулях используются токены @core/theme', () => {
    const cssFiles = getAllFiles(SRC_DIR, ['.css']).filter((f) => f.endsWith('.module.css'));
    for (const file of cssFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      const colorLines = content.split('\n').filter((line) => {
        if (!line.includes('color:') && !line.includes('background:')) return false;
        if (line.includes('var(--')) return false;
        if (line.includes('transparent') || line.includes('inherit') || line.includes('none')) return false;
        if (line.includes('color-mix(') || line.includes('hsl(') || line.includes('rgb(') || line.includes('oklch(')) return false;
        // Явный хардкод: hex (#fff), rgb без var, named colors
        return /#[0-9a-fA-F]{3,8}/.test(line);
      });
      expect(colorLines, `Хардкод цвета в ${path.basename(file)}`).toHaveLength(0);
    }
  });
});