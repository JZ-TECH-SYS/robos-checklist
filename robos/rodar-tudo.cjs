// UM comando que roda todos os robôs de um sistema, em fila, e chama o fiscal no fim (17/11/2026).
// node rodar-tudo.cjs <planilha.tsv> <roteiro.cjs>
// roteiro.cjs = [ { robo: 'formularios', config: 'caminho/config.cjs', env?: { BASE: '...' } }, ... ]  (na ordem)
// Em FILA de propósito: os robôs entram com o mesmo login e o de baixo derruba a sessão do de cima; e cada um grava
// <planilha>.novo, que é aplicado na planilha ANTES do próximo (senão o seguinte apaga o resultado do anterior).
// Robô que só lê config (sem planilha, ex.: medidas, larguras) entra com planilha: false e o resultado vai só para o log.
const { spawnSync } = require('child_process'), fs = require('fs'), path = require('path');
const [planilha, roteiroArq] = process.argv.slice(2);
const roteiro = require(path.resolve(roteiroArq));
const log = path.join(path.dirname(planilha), 'logs'); fs.mkdirSync(log, { recursive: true });
const res = [];
for (const r of roteiro) {
  const t0 = Date.now();
  const args = [path.join(__dirname, r.robo + '.cjs'), ...(r.planilha === false ? [] : [planilha]), r.config, ...(r.args || [])];
  const x = spawnSync(process.execPath, args, { env: { ...process.env, ...r.env }, encoding: 'utf8', maxBuffer: 64e6 });
  fs.writeFileSync(path.join(log, r.robo + '.log'), (x.stdout || '') + (x.stderr || ''));
  const novo = planilha + '.novo';
  const aplicado = fs.existsSync(novo) && (fs.renameSync(novo, planilha), true);
  res.push({ robo: r.robo, ok: x.status === 0, min: ((Date.now() - t0) / 60000).toFixed(1), aplicado });
  console.log(`${x.status === 0 ? 'ok   ' : 'FALHOU'} ${r.robo} (${res.at(-1).min} min)${aplicado ? ' → planilha' : ''}`);
}
const py = [path.join(__dirname, '..', 'checklist-planilha.py'), path.join(__dirname, '..', 'checklist', 'checklist-planilha.py')].find(fs.existsSync);  // geral/ ou o repositório
const fiscal = spawnSync('python', [py, 'conferir', planilha], { encoding: 'utf8' });
console.log(fiscal.stdout + fiscal.stderr);
process.exit(res.every((r) => r.ok) ? 0 : 1);
