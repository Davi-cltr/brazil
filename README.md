# Brasil

Um passeio animado pelo Brasil, do mapa ao batuque. O site atravessa as cinco regiões num mapa 3D dos 27 estados, passa pelos seis biomas e termina com ritmos que tocam de verdade, comida, festas, futebol, cidades e azulejos.

Publicado em: https://davi-cltr.github.io/brazil/

## Seções e animações

| Seção | O que acontece |
| --- | --- |
| Abertura | O contorno dos 27 estados se desenha enquanto um contador vai a 100, e a tela sobe como uma cortina. |
| Mapa | Mapa 3D extrudado com a malha real do IBGE. Os estados caem em cascata, o mapa inclina com o cursor e o estado sob o cursor levanta e mostra nome, capital e região. Atrás, a palavra “Brasil” estica e engorda perto do cursor (eixos de largura e peso da fonte variável). Relógios ao vivo nos quatro fusos do país. |
| Regiões | Cenas presas na tela: a cada rolagem, a câmera viaja até uma região, os estados dela sobem e ganham cor, e as siglas aparecem sobre o mapa. Os textos entram palavra por palavra. |
| Números | Odômetros que giram dígito a dígito (Censo 2022, área, municípios, litoral) e um letreiro duplo com todos os estados, que acelera com a velocidade da rolagem. |
| Manifesto | O texto acende palavra por palavra conforme a rolagem, e algumas palavras ganham cor. |
| Biomas | Seis paisagens ilustradas em camadas que se movem com o cursor, cada uma com partículas próprias: chuva, sementes, névoa, poeira, vento e pássaros. As cenas trocam por um círculo que se abre, e um minimapa mostra a área real de cada bioma. |
| Palavras | Cartas que viram em 3D e letras que embaralham antes de assentar. |
| Ritmos | Sequenciador de 16 passos com samba, forró, frevo e bossa nova. Os instrumentos são sintetizados com a Web Audio API, o agendamento é antecipado (o som não depende da taxa de quadros) e um visualizador circular reage ao áudio. Dá para editar cada passo e mudar o andamento. |
| Sabores | Galeria para arrastar com inércia, efeito elástico nas bordas e cartões que inclinam com a velocidade. |
| Festas | Bandeirinhas de São João com física de corda (Verlet): o cursor empurra as cordas. Clique para soltar confete. |
| Futebol | As cinco estrelas se desenham e um jogo de embaixadinha com física, som e recorde salvo no navegador. |
| Cidades | Cartas que se empilham presas na tela: a de baixo encolhe e escurece enquanto a próxima sobe. |
| Azulejos | Grade de azulejos que gira em onda a partir do cursor. |
| Rodapé | As letras de BRASIL caem com física (Matter.js) e dá para pegar e jogar. Calçadão de ondas em movimento. |

Em todo o site: rolagem suave (Lenis), fundo que muda de cor por seção, cursor próprio com rótulos, menu em tela cheia que abre em círculo, texto que rola letra a letra nos botões e granulado de impressão.

Com `prefers-reduced-motion` ativado, as passagens viram troca direta, as partículas e a física param e os números aparecem prontos.

## Tecnologias

- React, Vite e TypeScript
- Tailwind CSS v4
- Three.js (mapa 3D, carregado sob demanda) e d3-geo (projeção)
- Motion, Lenis e Matter.js
- Web Audio API, Canvas 2D e SVG
- Fontes Anybody e Hanken Grotesk, via Fontsource

## Rodar no computador

```bash
npm install
npm run dev
```

Versão final: `npm run build` (sai na pasta `dist`).

## Publicação

O fluxo `.github/workflows/deploy.yml` publica no GitHub Pages a cada envio para a `main`. Em **Settings > Pages**, a fonte precisa estar em **GitHub Actions**.

## Dados e créditos

- População, área, municípios, regiões e biomas: IBGE (Censo 2022, Área Territorial 2025, Biomas e Sistema Costeiro-Marinho 2019). Números arredondados quando indicado.
- Malha dos estados: IBGE, via [GeoDadosBrasil](https://github.com/cristoferluch/GeoDadosBrasil) (CC0).
- Limites dos biomas: IBGE, na versão simplificada do pacote [florabr](https://github.com/wevertonbio/florabr) (GPL-3).
- Patrimônios: UNESCO e IPHAN.
- Ilustrações, sons sintetizados e animações foram feitos para este projeto.
