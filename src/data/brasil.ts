// Fontes: IBGE (Censo 2022, Área Territorial, Biomas 2019), UNESCO, IPHAN.
// Números arredondados quando indicado.

export type RegiaoId = 'norte' | 'nordeste' | 'centro-oeste' | 'sudeste' | 'sul'

export interface UF {
  sigla: string
  nome: string
  capital: string
  regiao: RegiaoId
}

export const UFS: UF[] = [
  { sigla: 'AC', nome: 'Acre', capital: 'Rio Branco', regiao: 'norte' },
  { sigla: 'AP', nome: 'Amapá', capital: 'Macapá', regiao: 'norte' },
  { sigla: 'AM', nome: 'Amazonas', capital: 'Manaus', regiao: 'norte' },
  { sigla: 'PA', nome: 'Pará', capital: 'Belém', regiao: 'norte' },
  { sigla: 'RO', nome: 'Rondônia', capital: 'Porto Velho', regiao: 'norte' },
  { sigla: 'RR', nome: 'Roraima', capital: 'Boa Vista', regiao: 'norte' },
  { sigla: 'TO', nome: 'Tocantins', capital: 'Palmas', regiao: 'norte' },
  { sigla: 'AL', nome: 'Alagoas', capital: 'Maceió', regiao: 'nordeste' },
  { sigla: 'BA', nome: 'Bahia', capital: 'Salvador', regiao: 'nordeste' },
  { sigla: 'CE', nome: 'Ceará', capital: 'Fortaleza', regiao: 'nordeste' },
  { sigla: 'MA', nome: 'Maranhão', capital: 'São Luís', regiao: 'nordeste' },
  { sigla: 'PB', nome: 'Paraíba', capital: 'João Pessoa', regiao: 'nordeste' },
  { sigla: 'PE', nome: 'Pernambuco', capital: 'Recife', regiao: 'nordeste' },
  { sigla: 'PI', nome: 'Piauí', capital: 'Teresina', regiao: 'nordeste' },
  { sigla: 'RN', nome: 'Rio Grande do Norte', capital: 'Natal', regiao: 'nordeste' },
  { sigla: 'SE', nome: 'Sergipe', capital: 'Aracaju', regiao: 'nordeste' },
  { sigla: 'DF', nome: 'Distrito Federal', capital: 'Brasília', regiao: 'centro-oeste' },
  { sigla: 'GO', nome: 'Goiás', capital: 'Goiânia', regiao: 'centro-oeste' },
  { sigla: 'MT', nome: 'Mato Grosso', capital: 'Cuiabá', regiao: 'centro-oeste' },
  { sigla: 'MS', nome: 'Mato Grosso do Sul', capital: 'Campo Grande', regiao: 'centro-oeste' },
  { sigla: 'ES', nome: 'Espírito Santo', capital: 'Vitória', regiao: 'sudeste' },
  { sigla: 'MG', nome: 'Minas Gerais', capital: 'Belo Horizonte', regiao: 'sudeste' },
  { sigla: 'RJ', nome: 'Rio de Janeiro', capital: 'Rio de Janeiro', regiao: 'sudeste' },
  { sigla: 'SP', nome: 'São Paulo', capital: 'São Paulo', regiao: 'sudeste' },
  { sigla: 'PR', nome: 'Paraná', capital: 'Curitiba', regiao: 'sul' },
  { sigla: 'RS', nome: 'Rio Grande do Sul', capital: 'Porto Alegre', regiao: 'sul' },
  { sigla: 'SC', nome: 'Santa Catarina', capital: 'Florianópolis', regiao: 'sul' },
]

export const UF_BY_SIGLA = Object.fromEntries(UFS.map((u) => [u.sigla, u])) as Record<string, UF>

export interface Regiao {
  id: RegiaoId
  nome: string
  cor: string
  titulo: string
  texto: string
  fatos: { rotulo: string; valor: string }[]
}

export const REGIOES: Regiao[] = [
  {
    id: 'norte',
    nome: 'Norte',
    cor: '#3BAA6B',
    titulo: 'O Norte é quase metade do mapa',
    texto: 'Sete estados e 45% do território, quase todo coberto pela Amazônia. É a região com menos gente por quilômetro quadrado, e onde os rios fazem o papel das estradas.',
    fatos: [
      { rotulo: 'Estados', valor: '7' },
      { rotulo: 'Do território', valor: '45%' },
      { rotulo: 'Por km²', valor: '4,5 pessoas' },
    ],
  },
  {
    id: 'nordeste',
    nome: 'Nordeste',
    cor: '#FFC93C',
    titulo: 'Nove estados e o litoral mais longo',
    texto: 'O Nordeste tem mais estados do que qualquer outra região. Foi no litoral da Bahia que os portugueses chegaram em 1500, e é dali que vêm o frevo, o forró e o baião.',
    fatos: [
      { rotulo: 'Estados', valor: '9' },
      { rotulo: 'Da população', valor: '26,9%' },
      { rotulo: 'Primeira capital', valor: 'Salvador' },
    ],
  },
  {
    id: 'centro-oeste',
    nome: 'Centro-Oeste',
    cor: '#E4572E',
    titulo: 'O centro tem capital desenhada',
    texto: 'Três estados e o Distrito Federal, entre o Cerrado e o Pantanal. Brasília foi planejada do zero e inaugurada em 1960, para levar a capital para o interior.',
    fatos: [
      { rotulo: 'Unidades', valor: '3 + DF' },
      { rotulo: 'Capital desde', valor: '1960' },
      { rotulo: 'Pantanal', valor: 'MT e MS' },
    ],
  },
  {
    id: 'sudeste',
    nome: 'Sudeste',
    cor: '#5B8DEF',
    titulo: 'O Sudeste concentra quatro em cada dez',
    texto: 'Quatro estados e as duas maiores cidades do país, São Paulo e Rio. Com 11% do território, o Sudeste abriga 41,8% da população brasileira.',
    fatos: [
      { rotulo: 'Estados', valor: '4' },
      { rotulo: 'Da população', valor: '41,8%' },
      { rotulo: 'Por km²', valor: '91,8 pessoas' },
    ],
  },
  {
    id: 'sul',
    nome: 'Sul',
    cor: '#C77DFF',
    titulo: 'O Sul tem inverno de verdade',
    texto: 'Três estados quase inteiros ao sul do Trópico de Capricórnio, onde as estações são mais marcadas. É ali que fica o Pampa, o único bioma brasileiro que existe em um só estado.',
    fatos: [
      { rotulo: 'Estados', valor: '3' },
      { rotulo: 'Bioma exclusivo', valor: 'Pampa (RS)' },
      { rotulo: 'Fronteiras', valor: '3 países' },
    ],
  },
]

export interface Bioma {
  id: string
  nome: string
  pct: number
  areaKm2: string
  titulo: string
  texto: string
  cores: { ceu: string; fundo: string; meio: string; frente: string; acento: string; texto: string }
}

// IBGE, Biomas e Sistema Costeiro-Marinho do Brasil (2019)
export const BIOMAS: Bioma[] = [
  {
    id: 'amazonia',
    nome: 'Amazônia',
    pct: 49.5,
    areaKm2: '4,2 milhões',
    titulo: 'Amazônia: metade do Brasil é floresta',
    texto: 'O maior bioma do país ocupa quase metade do território. Chove muito, quase o ano inteiro, e os rios sobem e descem vários metros entre a cheia e a seca.',
    cores: { ceu: '#0B2E22', fundo: '#0F4A33', meio: '#1C6E47', frente: '#2E9A5E', acento: '#7FE0C3', texto: '#EAF7EF' },
  },
  {
    id: 'cerrado',
    nome: 'Cerrado',
    pct: 23.3,
    areaKm2: '1,98 milhão',
    titulo: 'Cerrado: a savana das nascentes',
    texto: 'Árvores de tronco torto, casca grossa e raízes fundas. No Cerrado nascem rios que abastecem várias das grandes bacias do país, e a seca e as chuvas se alternam com força.',
    cores: { ceu: '#F6C453', fundo: '#E09A2D', meio: '#B8742A', frente: '#6E4A22', acento: '#FFF1C9', texto: '#2A1A08' },
  },
  {
    id: 'mata-atlantica',
    nome: 'Mata Atlântica',
    pct: 13.0,
    areaKm2: '1,1 milhão',
    titulo: 'Mata Atlântica: a floresta da costa',
    texto: 'Uma faixa de floresta que acompanha o litoral e sobe as serras. É o bioma onde vive a maior parte dos brasileiros, e também o que mais perdeu área natural.',
    cores: { ceu: '#BFE3E0', fundo: '#4E9C93', meio: '#1E6B63', frente: '#0E4A44', acento: '#2347A6', texto: '#06231F' },
  },
  {
    id: 'caatinga',
    nome: 'Caatinga',
    pct: 10.1,
    areaKm2: '863 mil',
    titulo: 'Caatinga: só existe no Brasil',
    texto: 'Na seca, a mata fica cinza e parece morta. Basta chover para ficar verde em poucos dias. A Caatinga é o único bioma que existe exclusivamente em território brasileiro.',
    cores: { ceu: '#F2E3C6', fundo: '#D9B48A', meio: '#B07D52', frente: '#6F4E37', acento: '#4F7A3A', texto: '#2B1B10' },
  },
  {
    id: 'pampa',
    nome: 'Pampa',
    pct: 2.3,
    areaKm2: '194 mil',
    titulo: 'Pampa: campo a perder de vista',
    texto: 'Coxilhas cobertas de capim, vento constante e pouca árvore. No Brasil, o Pampa só existe no Rio Grande do Sul, e continua pelo Uruguai e pela Argentina.',
    cores: { ceu: '#D7ECF2', fundo: '#9CC57A', meio: '#6A9E4C', frente: '#3E6E33', acento: '#F4F1DE', texto: '#16301A' },
  },
  {
    id: 'pantanal',
    nome: 'Pantanal',
    pct: 1.8,
    areaKm2: '151 mil',
    titulo: 'Pantanal: a maior planície alagável',
    texto: 'Na época das chuvas, boa parte da planície fica debaixo d’água. É o menor bioma do país e um dos melhores lugares do mundo para ver bicho solto: tuiuiús, jacarés, capivaras e onças.',
    cores: { ceu: '#F79D5C', fundo: '#F3C26B', meio: '#3C7A8C', frente: '#1D4E5F', acento: '#FFE7C2', texto: '#1C1206' },
  },
]

export const PALAVRAS = [
  { palavra: 'Saudade', sentido: 'A falta que alguém ou algum lugar faz, com um pouco de carinho e um pouco de dor.' },
  { palavra: 'Cafuné', sentido: 'Carinho feito passando os dedos devagar no cabelo de alguém.' },
  { palavra: 'Gambiarra', sentido: 'Conserto improvisado, com o que tiver à mão, que funciona melhor do que devia.' },
  { palavra: 'Xodó', sentido: 'A pessoa ou a coisa de que você mais gosta. Também serve para chamar quem se ama.' },
  { palavra: 'Chamego', sentido: 'Carinho grudado, de quem não quer desgrudar.' },
  { palavra: 'Fuzuê', sentido: 'Bagunça animada, confusão alegre, festa que saiu do controle.' },
]

export interface Ritmo {
  id: string
  nome: string
  origem: string
  texto: string
  bpm: number
  cor: string
  trilhas: { inst: Instrumento; nome: string; passos: string }[]
}

export type Instrumento = 'surdo' | 'surdoAgudo' | 'tamborim' | 'agogoAlto' | 'agogoBaixo' | 'ganza' | 'zabumba' | 'bacalhau' | 'triangulo' | 'trianguloAberto' | 'caixa' | 'aro' | 'bumbo'

// Padrões simplificados, em 16 passos (semicolcheias). "x" = toque, "." = pausa.
export const RITMOS: Ritmo[] = [
  {
    id: 'samba',
    nome: 'Samba',
    origem: 'Rio de Janeiro',
    texto: 'O samba ganhou o país a partir de 1917, com “Pelo Telefone”, considerado o primeiro samba gravado. A bateria se apoia no surdo, que marca o segundo tempo, e no tamborim, que faz o desenho por cima.',
    bpm: 100,
    cor: '#FFC93C',
    trilhas: [
      { inst: 'surdoAgudo', nome: 'Surdo de segunda', passos: 'x.......x.......' },
      { inst: 'surdo', nome: 'Surdo de primeira', passos: '....x.......x...' },
      { inst: 'tamborim', nome: 'Tamborim', passos: 'x.xx.x.x.x.xx.x.' },
      { inst: 'agogoAlto', nome: 'Agogô agudo', passos: 'x...x.x.....x...' },
      { inst: 'agogoBaixo', nome: 'Agogô grave', passos: '..x.....x.x...x.' },
      { inst: 'ganza', nome: 'Ganzá', passos: 'xxxxxxxxxxxxxxxx' },
    ],
  },
  {
    id: 'forro',
    nome: 'Forró',
    origem: 'Nordeste',
    texto: 'Zabumba, triângulo e sanfona: o trio do forró. A batida de baião, popularizada por Luiz Gonzaga nos anos 1940, é um passo longo e dois curtos, que convida a dançar colado.',
    bpm: 112,
    cor: '#E4572E',
    trilhas: [
      { inst: 'zabumba', nome: 'Zabumba', passos: 'x..xx...x..xx...' },
      { inst: 'bacalhau', nome: 'Bacalhau', passos: '..x...x...x...x.' },
      { inst: 'triangulo', nome: 'Triângulo fechado', passos: 'x.x.x.x.x.x.x.x.' },
      { inst: 'trianguloAberto', nome: 'Triângulo aberto', passos: '.x.x.x.x.x.x.x.x' },
    ],
  },
  {
    id: 'frevo',
    nome: 'Frevo',
    origem: 'Recife',
    texto: 'Rápido como o nome, que vem de “ferver”. O frevo nasceu no carnaval do Recife e foi reconhecido pela UNESCO como patrimônio imaterial da humanidade em 2012.',
    bpm: 140,
    cor: '#C77DFF',
    trilhas: [
      { inst: 'bumbo', nome: 'Surdo', passos: 'x...x...x...x...' },
      { inst: 'caixa', nome: 'Caixa', passos: 'x.xxx.xxx.xxx.xx' },
      { inst: 'ganza', nome: 'Pandeiro', passos: '.x.x.x.x.x.x.x.x' },
      { inst: 'tamborim', nome: 'Tarol', passos: '..x...x...x...xx' },
    ],
  },
  {
    id: 'bossa',
    nome: 'Bossa nova',
    origem: 'Rio de Janeiro',
    texto: 'No fim dos anos 1950, o samba ficou baixinho e sofisticado. A batida de violão de João Gilberto, em “Chega de Saudade” (1958), virou a bossa nova.',
    bpm: 76,
    cor: '#5B8DEF',
    trilhas: [
      { inst: 'bumbo', nome: 'Bumbo', passos: 'x..x....x..x....' },
      { inst: 'aro', nome: 'Aro', passos: 'x..x..x...x..x..' },
      { inst: 'ganza', nome: 'Chocalho', passos: 'x.x.x.x.x.x.x.x.' },
    ],
  },
]

export const SABORES = [
  { id: 'paodequeijo', nome: 'Pão de queijo', lugar: 'Minas Gerais', texto: 'Polvilho, queijo e ovo. Crocante por fora, puxa por dentro.', cor: '#FFC93C' },
  { id: 'acaraje', nome: 'Acarajé', lugar: 'Bahia', texto: 'Bolinho de feijão-fradinho frito no dendê. O ofício das baianas de acarajé é patrimônio imaterial desde 2005.', cor: '#E4572E' },
  { id: 'acai', nome: 'Açaí', lugar: 'Pará', texto: 'No Pará, vai na tigela com peixe frito e farinha. No resto do país, virou sobremesa gelada.', cor: '#6B2D5C' },
  { id: 'feijoada', nome: 'Feijoada', lugar: 'Brasil inteiro', texto: 'Feijão-preto com carnes, arroz, couve, farofa e laranja. Prato de sábado.', cor: '#F29D38' },
  { id: 'tacaca', nome: 'Tacacá', lugar: 'Pará e Amazonas', texto: 'Caldo de tucupi com goma, camarão e jambu, a folha que deixa a boca dormente.', cor: '#D9A21B' },
  { id: 'brigadeiro', nome: 'Brigadeiro', lugar: 'Brasil inteiro', texto: 'Leite condensado, chocolate e manteiga, enrolado e passado no granulado. Sem ele, não é festa.', cor: '#5A3420' },
  { id: 'chimarrao', nome: 'Chimarrão', lugar: 'Rio Grande do Sul', texto: 'Erva-mate na cuia com água quente, passada de mão em mão na roda.', cor: '#4F7A3A' },
]

export const CIDADES = [
  { id: 'rio', nome: 'Rio de Janeiro', uf: 'RJ', fato: 'O Cristo Redentor, inaugurado em 1931, olha a cidade do alto do Corcovado.', cor: '#2347A6', fg: '#F7F4EC' },
  { id: 'salvador', nome: 'Salvador', uf: 'BA', fato: 'Foi a primeira capital do Brasil, de 1549 a 1763. O Elevador Lacerda liga a Cidade Baixa à Alta.', cor: '#FFC93C', fg: '#1A1206' },
  { id: 'saopaulo', nome: 'São Paulo', uf: 'SP', fato: 'A maior cidade do país: 11,4 milhões de pessoas no Censo 2022.', cor: '#1E1E1E', fg: '#F7F4EC' },
  { id: 'brasilia', nome: 'Brasília', uf: 'DF', fato: 'Inaugurada em 21 de abril de 1960, com plano de Lúcio Costa e prédios de Oscar Niemeyer.', cor: '#F7F4EC', fg: '#0B1410' },
  { id: 'manaus', nome: 'Manaus', uf: 'AM', fato: 'Perto da cidade, o Rio Negro e o Solimões correm lado a lado por quilômetros sem misturar as águas.', cor: '#0F4A33', fg: '#F7F4EC' },
  { id: 'recife', nome: 'Recife', uf: 'PE', fato: 'Cidade de pontes e de frevo. Do lado, Olinda tem o centro histórico tombado pela UNESCO em 1982.', cor: '#E4572E', fg: '#1A0A04' },
]

export const COPAS = [1958, 1962, 1970, 1994, 2002]

export const FUSOS = [
  { tz: 'America/Noronha', nome: 'Noronha', utc: 'UTC−2' },
  { tz: 'America/Sao_Paulo', nome: 'Brasília', utc: 'UTC−3' },
  { tz: 'America/Manaus', nome: 'Manaus', utc: 'UTC−4' },
  { tz: 'America/Rio_Branco', nome: 'Rio Branco', utc: 'UTC−5' },
]

export const NUMEROS = [
  { valor: 203080756, rotulo: 'pessoas no Censo 2022' },
  { valor: 8509360, rotulo: 'km² de território', sufixo: '' },
  { valor: 5570, rotulo: 'municípios' },
  { valor: 7367, rotulo: 'km de litoral' },
  { valor: 27, rotulo: 'unidades da federação' },
  { valor: 10, rotulo: 'vizinhos: só Chile e Equador ficam de fora' },
  { valor: 6, rotulo: 'biomas continentais' },
  { valor: 4, rotulo: 'fusos horários' },
]
