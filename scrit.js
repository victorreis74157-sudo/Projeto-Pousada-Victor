/* =========================================================
   script.js - Pousada Vista Mar
   Um único arquivo de JavaScript para as 5 telas.
   Cada tela só ativa a parte que usa (verificamos se o
   elemento existe na página antes de usar).
   ========================================================= */

/* ---------------------------------------------------------
   1) DADOS: array de objetos com os quartos
   Para adicionar um quarto novo, copie uma linha e mude os valores.
   --------------------------------------------------------- */
const quartos = [
  { id: 1, nome: "Standard Solteiro", categoria: "Standard", capacidade: 1, diaria: 150, descricao: "Cama de solteiro, ar-condicionado e Wi-Fi." },
  { id: 2, nome: "Standard Casal", categoria: "Standard", capacidade: 2, diaria: 220, descricao: "Cama de casal, TV e frigobar." },
  { id: 3, nome: "Luxo Vista Jardim", categoria: "Luxo", capacidade: 2, diaria: 320, descricao: "Varanda com vista para o jardim." },
  { id: 4, nome: "Luxo Vista Mar", categoria: "Luxo", capacidade: 2, diaria: 410, descricao: "Varanda com vista para o mar." },
  { id: 5, nome: "Suíte Master", categoria: "Suíte", capacidade: 3, diaria: 550, descricao: "Suíte ampla com banheira e sala de estar." },
  { id: 6, nome: "Suíte Lua de Mel", categoria: "Suíte", capacidade: 2, diaria: 620, descricao: "Suíte romântica com decoração especial." },
  { id: 7, nome: "Quarto Família", categoria: "Família", capacidade: 4, diaria: 480, descricao: "Uma cama de casal e duas de solteiro." },
  { id: 8, nome: "Família Plus", categoria: "Família", capacidade: 6, diaria: 650, descricao: "Dois ambientes, ideal para grupos grandes." }
];

/* Regra especial do tema: 12% de desconto a partir de 3 diárias */
const DIARIAS_PARA_DESCONTO = 3;
const PERCENTUAL_DESCONTO = 0.12;

/* ---------------------------------------------------------
   2) FUNÇÕES AUXILIARES (usadas em mais de uma tela)
   --------------------------------------------------------- */

// Função 1: transforma um número em dinheiro (ex.: 1234.5 -> R$ 1.234,50)
function formatarMoeda(valor) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// Função 2: calcula a estadia e aplica a regra do desconto (if / else)
function calcularEstadia(diaria, numeroDiarias, quantidade) {
  const subtotal = diaria * numeroDiarias * quantidade;
  let desconto = 0;

  if (numeroDiarias >= DIARIAS_PARA_DESCONTO) {
    desconto = subtotal * PERCENTUAL_DESCONTO;
  } else {
    desconto = 0;
  }

  return { subtotal: subtotal, desconto: desconto, total: subtotal - desconto };
}

// Função 3: devolve só os quartos de uma categoria (usa o filter)
function filtrarPorCategoria(categoria) {
  if (categoria === "Todos") {
    return quartos;
  }
  return quartos.filter(function (quarto) {
    return quarto.categoria === categoria;
  });
}

/* ---------------------------------------------------------
   3) TELA CATÁLOGO: cartões, filtro e contador
   --------------------------------------------------------- */

// Cria o cartão (HTML) de UM quarto
function criarCartao(quarto) {
  const cartao = document.createElement("article");
  cartao.className = "card";
  cartao.innerHTML =
    '<span class="etiqueta">' + quarto.categoria + "</span>" +
    "<h3>" + quarto.nome + "</h3>" +
    "<p>" + quarto.descricao + "</p>" +
    "<p>Capacidade: " + quarto.capacidade + " pessoa(s)</p>" +
    '<p class="preco">' + formatarMoeda(quarto.diaria) + " / diária</p>" +
    '<a class="botao" href="simulador.html?quarto=' + quarto.id + '">Simular</a>';
  return cartao;
}

// Desenha a lista de cartões e atualiza o contador
function mostrarCatalogo(lista) {
  const area = document.getElementById("lista-quartos");
  const contador = document.getElementById("contador");

  area.innerHTML = ""; // limpa os cartões antigos

  lista.forEach(function (quarto) {
    area.appendChild(criarCartao(quarto));
  });

  // Soma das diárias dos quartos exibidos (reduce)
  const total = lista.reduce(function (soma, quarto) {
    return soma + quarto.diaria;
  }, 0);

  contador.textContent =
    "Exibindo " + lista.length + " de " + quartos.length +
    " quartos | Soma das diárias exibidas: " + formatarMoeda(total);
}

function iniciarCatalogo() {
  const botoes = document.querySelectorAll(".filtro");
  if (botoes.length === 0) {
    return; // não estamos na tela do catálogo
  }

  mostrarCatalogo(quartos); // mostra todos ao abrir a página

  // Evento de CLICK em cada botão de filtro
  botoes.forEach(function (botao) {
    botao.addEventListener("click", function () {
      botoes.forEach(function (b) { b.classList.remove("ativo"); });
      botao.classList.add("ativo");
      mostrarCatalogo(filtrarPorCategoria(botao.dataset.categoria));
    });
  });
}

/* ---------------------------------------------------------
   4) TELA SIMULADOR
   --------------------------------------------------------- */
function iniciarSimulador() {
  const formulario = document.getElementById("form-simulador");
  if (!formulario) {
    return; // não estamos na tela do simulador
  }

  const selectQuarto = document.getElementById("quarto");
  const campoDiarias = document.getElementById("diarias");
  const campoQuantidade = document.getElementById("quantidade");
  const erro = document.getElementById("erro-simulador");
  const resultado = document.getElementById("resultado");

  // Cria as opções do select a partir do array
  quartos.forEach(function (quarto) {
    const opcao = document.createElement("option");
    opcao.value = quarto.id;
    opcao.textContent = quarto.nome + " - " + formatarMoeda(quarto.diaria);
    selectQuarto.appendChild(opcao);
  });

  // Se veio do catálogo (simulador.html?quarto=3), já deixa o quarto escolhido
  const parametros = new URLSearchParams(window.location.search);
  const quartoDaUrl = parametros.get("quarto");
  if (quartoDaUrl) {
    selectQuarto.value = quartoDaUrl;
  }

  // Evento de SUBMIT do formulário
  formulario.addEventListener("submit", function (evento) {
    evento.preventDefault(); // impede a página de recarregar

    const numeroDiarias = Number(campoDiarias.value);
    const quantidade = Number(campoQuantidade.value);

    if (numeroDiarias < 1 || quantidade < 1 || !Number.isInteger(numeroDiarias) || !Number.isInteger(quantidade)) {
      erro.textContent = "Informe números inteiros maiores que zero.";
      resultado.hidden = true;
      return;
    }
    erro.textContent = "";

    // Encontra o quarto escolhido dentro do array
    const quarto = quartos.find(function (q) {
      return q.id === Number(selectQuarto.value);
    });

    const calculo = calcularEstadia(quarto.diaria, numeroDiarias, quantidade);

    let linhaDesconto = "";
    if (calculo.desconto > 0) {
      linhaDesconto = "<p>Desconto de 12%: - " + formatarMoeda(calculo.desconto) + "</p>";
    } else {
      linhaDesconto = "<p>Sem desconto (a partir de 3 diárias você ganha 12%).</p>";
    }

    resultado.innerHTML =
      "<p><strong>" + quarto.nome + "</strong></p>" +
      "<p>" + numeroDiarias + " diária(s) &times; " + quantidade + " quarto(s) &times; " + formatarMoeda(quarto.diaria) + "</p>" +
      "<p>Subtotal: " + formatarMoeda(calculo.subtotal) + "</p>" +
      linhaDesconto +
      '<p class="total-final">Total: ' + formatarMoeda(calculo.total) + "</p>";
    resultado.hidden = false;
  });
}

/* ---------------------------------------------------------
   5) TELA CADASTRO: validação com 5 regras
   --------------------------------------------------------- */

// Mostra (ou limpa) a mensagem de erro de um campo
function mostrarErro(idCampo, mensagem) {
  document.getElementById("erro-" + idCampo).textContent = mensagem;
  const campo = document.getElementById(idCampo);
  if (mensagem) {
    campo.classList.add("invalido");
  } else {
    campo.classList.remove("invalido");
  }
}

// Valida o formulário inteiro. Devolve true se tudo estiver certo.
function validarCadastro() {
  let valido = true;

  const nome = document.getElementById("nome").value.trim();
  const email = document.getElementById("email").value.trim();
  const telefone = document.getElementById("telefone").value.replace(/\D/g, ""); // só números
  const checkin = document.getElementById("checkin").value;
  const hospedes = Number(document.getElementById("hospedes").value);

  // Regra 1: nome com pelo menos 3 letras
  if (nome.length < 3) {
    mostrarErro("nome", "Digite seu nome completo (mínimo 3 letras).");
    valido = false;
  } else {
    mostrarErro("nome", "");
  }

  // Regra 2: e-mail precisa ter @ e ponto depois do @
  if (!email.includes("@") || email.indexOf(".", email.indexOf("@")) === -1) {
    mostrarErro("email", "Digite um e-mail válido, como nome@email.com.");
    valido = false;
  } else {
    mostrarErro("email", "");
  }

  // Regra 3: telefone com 10 ou 11 números (DDD + número)
  if (telefone.length < 10 || telefone.length > 11) {
    mostrarErro("telefone", "Digite o DDD e o número (10 ou 11 dígitos).");
    valido = false;
  } else {
    mostrarErro("telefone", "");
  }

  // Regra 4: check-in preenchido e que não seja uma data passada
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  if (checkin === "") {
    mostrarErro("checkin", "Escolha a data de entrada.");
    valido = false;
  } else if (new Date(checkin + "T00:00:00") < hoje) {
    mostrarErro("checkin", "A data não pode estar no passado.");
    valido = false;
  } else {
    mostrarErro("checkin", "");
  }

  // Regra 5: entre 1 e 10 hóspedes
  if (!Number.isInteger(hospedes) || hospedes < 1 || hospedes > 10) {
    mostrarErro("hospedes", "Informe de 1 a 10 hóspedes.");
    valido = false;
  } else {
    mostrarErro("hospedes", "");
  }

  return valido;
}

function iniciarCadastro() {
  const formulario = document.getElementById("form-cadastro");
  if (!formulario) {
    return; // não estamos na tela de cadastro
  }

  const mensagem = document.getElementById("mensagem-sucesso");

  // Evento de SUBMIT do formulário
  formulario.addEventListener("submit", function (evento) {
    evento.preventDefault(); // impede o envio de verdade

    if (validarCadastro()) {
      const nome = document.getElementById("nome").value.trim();
      mensagem.textContent = "Cadastro enviado com sucesso, " + nome + "! Entraremos em contato.";
      mensagem.hidden = false;
      formulario.reset();
    } else {
      mensagem.hidden = true;
    }
  });
}

/* ---------------------------------------------------------
   6) TELA SOBRE: perguntas frequentes que abrem e fecham
   --------------------------------------------------------- */
function iniciarFaq() {
  const perguntas = document.querySelectorAll(".faq-pergunta");

  // Evento de CLICK em cada pergunta
  perguntas.forEach(function (botao) {
    botao.addEventListener("click", function () {
      const resposta = botao.nextElementSibling; // o <p> logo depois do botão
      const estavaFechada = resposta.hidden;

      resposta.hidden = !estavaFechada; // abre se estava fechada, fecha se estava aberta
      botao.setAttribute("aria-expanded", String(estavaFechada));
    });
  });
}

/* ---------------------------------------------------------
   7) INÍCIO: quando a página carrega, liga cada parte
   --------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", function () {
  iniciarCatalogo();
  iniciarSimulador();
  iniciarCadastro();
  iniciarFaq();
});