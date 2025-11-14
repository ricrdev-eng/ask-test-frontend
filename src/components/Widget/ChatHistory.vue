<script setup>
import { ref, onMounted, computed } from 'vue'
import { $api } from 'boot/axios'

onMounted(async() => {
  await createClientId();
})

const isTyping = ref(false)
const displayReplyMessages = async (messages) => {
  for (const msg of messages) {
    isTyping.value = true
    await new Promise(resolve => setTimeout(resolve, 600))

    isTyping.value = false
    conversationMessages.value.push(msg)

    await new Promise(resolve => setTimeout(resolve, 300))
  }
}

const userInput = ref('')
const carouselSlide = ref(0)

const clientId = ref(null)
const createClientId = async () => {
  let userId = localStorage.getItem("chat_client_id");
  if (!userId) {
    userId = crypto.randomUUID();
    localStorage.setItem("chat_client_id", userId);
  }
  clientId.value = userId;
}

const isMinimized = ref(true)
const isFullscreen = ref(false)
const closeConversation = async () => {
  const payload = {
    conversationId: conversation.value[0].conversationId,
    data: {
      isActive: false
    }
  }
  const { data } = await this.$api.backend.patch('/chat', payload)

  if (data.isActive) console.log('Não foi possível fechar a conversa.')

  conversation.value = []
  conversationMessages.value = []
  toggleMinimize()
}
const openConversation = async () => {
  toggleMinimize()
  await startBotConversation()
}
const toggleMinimize = async () => {
  isMinimized.value = !isMinimized.value
  if (isMinimized.value) {
    isFullscreen.value = false
  }
}
const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
}

const isInputDisabled = computed(() => {
  if (!conversationMessages.value.length) return false

  const last = conversationMessages.value[conversationMessages.value.length - 1]
  return last.sender === "BOT" && last.type === "DATE"
})
const conversation = ref([])
const conversationMessages = ref([])
const sendMessage = async (message, messageType) => {
  userInput.value = ''
  if (!message) return
  const payload = {
    clientId: clientId.value,
    message: {
      type: messageType,
      text: message,
      sender: "USER"
    }
  }
  const response = await fetch(`${process.env.API_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  })

  conversationMessages.value.push(payload.message)

  const data = await response.json()
  if (data.messages.length > 0) {
    await displayReplyMessages(data.messages)
  }
}
const startBotConversation = async () => {
  isTyping.value = true
  if (!clientId.value) {
    await createClientId()
  }

  const payload = {
    clientId: clientId.value
  }

  const { data } = await $api.backend.post('/chat', payload)

  isTyping.value = false
  conversation.value.push(data)
  conversationMessages.value.splice(0)
  await displayReplyMessages(data.messages)

}
</script>

<template>
  <q-page style="background-color: black">
    <div
      v-if="isMinimized"
      class="chat-bubble"
      @click="openConversation"
    >
      <q-avatar size="50px" color="primary">
        <q-icon name="chat" color="white" size="28px" />
      </q-avatar>
    </div>

    <q-card v-else class="ask-chat-container" :class="{ 'fullscreen': isFullscreen }">
      <div class="chat-header">
        <div class="chat-header-info">
          <q-avatar round size="40px">
            <img src="https://cdn.quasar.dev/img/avatar.png">
          </q-avatar>
          <div class="chat-header-text">
            <div class="chat-header-title">RccD Resorts</div>
            <div class="chat-header-subtitle">Online - Pronto para ajudar</div>
          </div>
        </div>
        <div class="chat-header-actions">
          <q-btn flat dense round :icon="isFullscreen ? 'fullscreen_exit' : 'fullscreen'" color="white" size="md" @click="toggleFullscreen">
            <q-tooltip>{{ isFullscreen ? 'Sair da tela cheia' : 'Tela cheia' }}</q-tooltip>
          </q-btn>
          <q-btn flat dense round icon="close" color="white" size="md" @click="closeConversation">
            <q-tooltip> Finalizar conversa </q-tooltip>
          </q-btn>
        </div>
      </div>
      <q-scroll-area style="height: 100%; padding: 20px">
        <div
          v-for="(msg, msgIndex) in conversationMessages"
          :key="msgIndex"
          :class="{
            'message-row': msg.type !== 'CAROUSEL',
            'carousel-row': msg.type === 'CAROUSEL',
            'from-bot': msg.sender === 'BOT',
            'from-user': msg.sender === 'USER'}"
        >
          <q-card class="ask-chat-baloon" :class="{
            'bubble-bot': msg.sender === 'BOT',
            'bubble-user': msg.sender === 'USER' }"
          >
            <span class="ask-pa-10 row" v-html="msg.text"/>
            <template v-if="msg.type === 'DATE' && msgIndex === conversationMessages.length - 1">
              <q-date
                v-model="userInput"
                mask="YYYY-MM-DD"
                flat
                minimal
                color="primary"
                class="q-mt-sm row"
                @update:model-value="sendMessage(userInput, 'TEXT')"
              />
            </template>
            <template v-else-if="msg.type === 'CAROUSEL'">
              <div class="carousel-wrapper">

                <q-carousel
                  v-model="carouselSlide"
                  swipeable
                  animated
                  arrows
                  control-color="grey-8"
                  style="min-height: 200px"
                  class="carousel-card"
                >
                  <q-carousel-slide
                    v-for="(room, index) in msg.data.items"
                    :key="index"
                    :name="index"
                    class="column no-wrap"
                  >
                    <img
                      :src="room.image"
                      alt=""
                      class="carousel-img"
                    />

                    <div class="carousel-info">
                      <div class="carousel-title">{{ room.title }}
                        <q-tooltip> {{room}}</q-tooltip>
                      </div>
                      <div class="carousel-desc">{{ room.description }}</div>

                      <div
                        v-for="(price, priceIndex) in room.prices"
                        :key="priceIndex"
                        class="carousel-price"
                      >
                        <strong>{{ price.title }} — {{ price.value }}</strong>
                        <div class="text-caption">{{ price.description }}</div>
                      </div>
                    </div>

                  </q-carousel-slide>
                </q-carousel>

              </div>
            </template>
          </q-card>
        </div>
        <div v-if="isTyping" class="typing-wrapper" style="margin-top: 8px">
          <div class="typing-bubble">
            <span></span><span></span><span></span>
          </div>
        </div>
      </q-scroll-area>
      <div class="chat-input">
        <q-input
          :disable="isInputDisabled"
          v-model="userInput"
          outlined
          dense
          placeholder="Digite sua mensagem..."
          bg-color="white"
          @keyup.enter="sendMessage(userInput, 'TEXT')"
        >
          <template v-slot:append>
            <q-btn flat dense round icon="send" color="primary" />
          </template>
        </q-input>
      </div>
    </q-card>
  </q-page>
</template>

<style scoped>
.carousel-wrapper {
  width: 100%;
  margin: 10px 0;
}
.carousel-card {
  background: white;
  border-radius: 12px;
  padding: 8px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}
.carousel-img {
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: 10px;
}
.carousel-info {
  padding: 8px 4px;
}
.carousel-title {
  font-weight: bold;
  margin-top: 4px;
}
.carousel-desc {
  font-size: 12px;
  color: #555;
  margin-bottom: 6px;
}
.carousel-price {
  margin-top: 4px;
}
.ask-chat-container {
  position: fixed;
  right: 20px;
  bottom: 20px;
  width: 380px;
  height: 70vh;
  background-color: white;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  z-index: 9999;
}
.ask-chat-container.fullscreen {
  right: 0;
  bottom: 0;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  border-radius: 0;
  max-width: 100%;
  max-height: 100%;
}
.ask-chat-baloon {
  min-height: 40px;
  padding: 8px 12px;
  max-width: 90%;
  box-shadow: none;
  white-space: pre-line;
}

.fullscreen .chat-header {
  border-radius: 0;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #FF5722;
  color: white;
  border-radius: 20px;
}
.chat-header-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}
.chat-header-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.chat-header-title {
  font-size: 15px;
  font-weight: 600;
  line-height: 1.2;
}
.chat-header-subtitle {
  font-size: 12px;
  opacity: 0.9;
  line-height: 1.2;
}
.chat-header-actions {
  display: flex;
  gap: 4px;
}
.chat-input {
  padding: 16px;
  background-color: white;
  border-top: 1px solid #e0e0e0;
  border-radius: 0 0 12px 12px;
}

.fullscreen .chat-input {
  border-radius: 0;
}
.chat-bubble {
  position: fixed;
  left: 20px;
  bottom: 20px;
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  transition: all 0.3s ease;
  z-index: 9999;
}
.chat-bubble:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.5);
}

@media (max-width: 800px) {
  .ask-chat-container {
    right: 0;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: 0;
  }
}
.typing-wrapper {
  display: flex;
  margin-left: 8px;
}
.typing-bubble {
  background: #e4e6eb;
  padding: 8px 12px;
  border-radius: 15px;
  display: flex;
  gap: 4px;
}
.typing-bubble span {
  width: 6px;
  height: 6px;
  background: #6b6b6b;
  border-radius: 50%;
  animation: typing 1s infinite ease-in-out;
}
.typing-bubble span:nth-child(2) { animation-delay: 0.2s; }
.typing-bubble span:nth-child(3) { animation-delay: 0.4s; }

@keyframes typing {
  0%, 80%, 100% { opacity: 0.3; transform: translateY(0px); }
  40% { opacity: 1; transform: translateY(-3px); }
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0px); }
}
.ask-chat-baloon {
  animation: fadeIn 0.3s ease forwards;
}
.message-row {
  display: flex;
  width: 100%;
  margin-bottom: 10px;
}  .message-row.from-bot {
  justify-content: flex-start;
}
.message-row.from-user {
  justify-content: flex-end;
}

.bubble-bot {
  background: #f5f7fa;
  color: #616e7c;
  font-weight: 400;
  border-radius: 0px 12px 12px 12px;
}
.bubble-user {
  background: #FF5722;
  color: white;
  font-weight: 400;
  border-radius: 12px 0px 12px 12px;
}
</style>