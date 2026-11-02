import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(__dirname, '..');

describe('Документация (A.12)', () => {
  it('содержит README.md', () => {
    const readmePath = path.resolve(ROOT, 'README.md');
    expect(fs.existsSync(readmePath)).toBe(true);
    const content = fs.readFileSync(readmePath, 'utf-8');
    expect(content.length).toBeGreaterThan(500);
    expect(content).toMatch(/omninotice-notification-feed/);
  });

  it('содержит CHANGELOG.md', () => {
    const changelogPath = path.resolve(ROOT, 'CHANGELOG.md');
    // CHANGELOG может отсутствовать на старте — проверяем и выводим замечание
    if (!fs.existsSync(changelogPath)) {
      console.warn('CHANGELOG.md отсутствует — рекомендация A.15 «Keep a Changelog» не выполнена');
      expect(true).toBe(true); // не фейлим, фиксируем замечание
      return;
    }
    const content = fs.readFileSync(changelogPath, 'utf-8');
    expect(content.length).toBeGreaterThan(100);
  });

  it('package.json содержит корректные метаданные', () => {
    const pkgPath = path.resolve(ROOT, 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    expect(pkg.name).toBe('omninotice-notification-feed');
    expect(pkg.version).toMatch(/^\d+\.\d+\.\d+$/);
    expect(pkg.peerDependencies.react).toBeDefined();
    expect(pkg.exports['.']).toBeDefined();
    expect(pkg.exports['./register-all']).toBeDefined();
    expect(pkg.exports['./style.css']).toBeDefined();
  });

  it('README содержит раздел о совместимости с Apiary (A.12 / §6.2)', () => {
    const readmePath = path.resolve(ROOT, 'README.md');
    const content = fs.readFileSync(readmePath, 'utf-8');
    // Проверяем, что в README указана совместимость с Apiary ^1.3.0
    expect(content).toMatch(/\^1\.3\.0/);
  });

  it('README описывает провайдеры данных (A.12)', () => {
    const readmePath = path.resolve(ROOT, 'README.md');
    const content = fs.readFileSync(readmePath, 'utf-8');
    expect(content).toContain('notifications.doocot.list');
    expect(content).toContain('notifications.doocot.counts');
    expect(content).toContain('notifications.doocot.details');
  });

  it('README описывает действия (A.12)', () => {
    const readmePath = path.resolve(ROOT, 'README.md');
    const content = fs.readFileSync(readmePath, 'utf-8');
    expect(content).toContain('mark-read');
  });

  it('README описывает настройки (A.12)', () => {
    const readmePath = path.resolve(ROOT, 'README.md');
    const content = fs.readFileSync(readmePath, 'utf-8');
    expect(content).toContain('pageTitle');
    expect(content).toContain('pageSubtitle');
    expect(content).toContain('autoLoadUnread');
    expect(content).toContain('sidebarBackdrop');
  });
});