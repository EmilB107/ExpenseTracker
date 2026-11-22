<script setup>
import { ref, computed } from 'vue'
import {
  ClipboardDocumentIcon,
  CheckIcon,
  XMarkIcon,
  ComputerDesktopIcon,
  CloudIcon,
  ChevronDownIcon,
  ArrowTopRightOnSquareIcon,
  ExclamationTriangleIcon
} from '@heroicons/vue/24/outline'
import { SCOPE, isValidClientId } from '../utils/googleDrive'
import HelpTooltip from './HelpTooltip.vue'

const props = defineProps({
  clientId: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    required: true
  },
  error: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['save', 'close', 'sign-in', 'sign-out', 'retry'])

const isSignedIn = computed(() => props.status !== 'local')
const isBusy = computed(() => props.status === 'loading' || props.status === 'saving')
const smallButtonClass = 'px-4 py-1.5 border-2 border-gray-800 rounded-full hover:bg-gray-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed'

const origin = window.location.origin
const input = ref(props.clientId)
const copied = ref('')

const trimmed = computed(() => input.value.trim())
const isValid = computed(() => trimmed.value === '' || isValidClientId(trimmed.value))
const canSave = computed(() => isValid.value && trimmed.value !== props.clientId)

const copy = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    copied.value = text
    setTimeout(() => { if (copied.value === text) copied.value = '' }, 1500)
  } catch {
    copied.value = ''
  }
}

const save = () => {
  if (!canSave.value) return
  emit('save', trimmed.value)
}

// Wrap button and field names in **double asterisks** to show them in bold
const steps = [
  {
    title: 'Create a Google Cloud project',
    link: { label: 'Open Google Cloud Console', href: 'https://console.cloud.google.com/projectcreate' },
    details: [
      'Sign in with the Google account whose Drive you want to save to.',
      'If asked, agree to the Terms of Service. Skip any free trial offer, no credit card is needed.',
      'Enter any **Project name** (for example, Expense Tracker) and click **Create**.',
      'Wait a few seconds, then check that your new project is selected in the project picker at the top of the page.'
    ]
  },
  {
    title: 'Turn on the Google Drive API',
    link: { label: 'Open the Google Drive API page', href: 'https://console.cloud.google.com/apis/library/drive.googleapis.com' },
    details: ['Click **Enable**.']
  },
  {
    title: 'Set up the sign-in screen',
    link: { label: 'Open Google Auth Platform', href: 'https://console.cloud.google.com/auth/overview' },
    details: [
      'Click **Get started**.',
      '**App Information:** enter any app name, pick your email as the **User support email**, then click **Next**.',
      '**Audience:** choose **External**, then click **Next**.',
      '**Contact Information:** enter your email, then click **Next**.',
      '**Finish:** tick the box to agree to the policy, click **Continue**, then click **Create**.'
    ]
  },
  {
    title: "Allow access to the app's Drive folder",
    link: { label: 'Open Data Access', href: 'https://console.cloud.google.com/auth/scopes' },
    details: [
      'Click **Add or remove scopes**.',
      'Scroll to the bottom of the panel to **Manually add scopes**, paste the text below, and click **Add to table**.'
    ],
    copy: SCOPE,
    detailsAfter: ['Click **Update**, then click **Save** at the bottom of the page.']
  },
  {
    title: 'Add yourself as a test user',
    link: { label: 'Open Audience', href: 'https://console.cloud.google.com/auth/audience' },
    details: [
      'Under **Test users**, click **Add users**.',
      'Enter the same Google account email, then click **Save**.'
    ]
  },
  {
    title: 'Create your client ID',
    link: { label: 'Open Clients', href: 'https://console.cloud.google.com/auth/clients' },
    details: [
      'Click **Create client**.',
      'For **Application type**, choose **Web application**. The name can be anything.',
      'Under **Authorized JavaScript origins**, click **Add URI** and paste this website\'s address:'
    ],
    copy: origin,
    detailsAfter: [
      'Leave **Authorized redirect URIs** empty and click **Create**.',
      'Copy the **Client ID** from the popup. It ends in .apps.googleusercontent.com. You can find it again under Clients any time.',
      'The popup also shows a **Client secret** and warns you can\'t view it again. This app doesn\'t need it, so you can close the popup without saving it. Never paste the secret anywhere.',
      'One client ID works on all your devices. Paste the same one on your phone, laptop, or any other browser.'
    ]
  },
  {
    title: 'Paste it below and sign in',
    details: [
      'Paste your Client ID in the field below and click **Save**.',
      'Click **Sync with Google Drive** at the top of the page. If sign-in fails right away, wait a few minutes, since new client IDs can take a moment to start working.',
      'Google will warn that it **hasn\'t verified this app**. That\'s expected, since it\'s your own app. Click **Continue**.',
      '**Tick the checkbox** for Google Drive access, then click **Continue**. Sync won\'t work if it\'s left unticked.'
    ]
  }
]

const boldParts = (text) => text.split('**').map((part, index) => ({ text: part, bold: index % 2 === 1 }))

const buttonClass = 'px-5 sm:px-8 py-2 sm:py-2.5 text-sm sm:text-base border-2 border-gray-800 rounded-full hover:bg-gray-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed'
</script>

<template>
  <div class="modal-backdrop fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4"
    @click.self="emit('close')">
    <div class="modal-panel relative w-full max-w-lg my-auto bg-[#0f172a] border-2 border-gray-800 rounded-lg p-5 lg:p-8"
      role="dialog" aria-modal="true" aria-labelledby="sync-modal-title">
      <button type="button" @click="emit('close')" aria-label="Close"
        class="absolute top-3 right-3 p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
        <XMarkIcon class="w-5 h-5" />
      </button>

      <h2 id="sync-modal-title" class="text-xl font-bold mb-4 pr-8">Sync with Google Drive</h2>

      <div class="mb-4 flex items-start gap-3 rounded-lg border-2 border-gray-800 bg-black/30 px-4 py-3 text-sm">
        <template v-if="status === 'local'">
          <ComputerDesktopIcon class="w-5 h-5 shrink-0 text-gray-400" />
          <div class="flex-1 space-y-3">
            <div class="flex items-start gap-3">
              <p class="flex-1 font-medium">Currently saved in this browser only.</p>
              <HelpTooltip label="Where your expenses are saved">
                Your expenses live in this browser's local storage. Clearing site data or switching devices or
                browsers means they're gone.
              </HelpTooltip>
            </div>
            <p v-if="error" class="text-red-400">{{ error }}</p>
            <button v-if="clientId" type="button" :class="smallButtonClass" @click="emit('sign-in')">
              Sign in with Google
            </button>
          </div>
        </template>
        <template v-else>
          <ExclamationTriangleIcon v-if="status === 'expired' || status === 'error'"
            class="w-5 h-5 shrink-0 text-yellow-400" />
          <CloudIcon v-else class="w-5 h-5 shrink-0 text-green-400" />
          <div class="flex-1 space-y-3">
            <div class="flex items-start gap-3">
              <p class="flex-1 font-medium">
                <template v-if="status === 'expired'">Google sign-in expired after 1 hour. Your next save reconnects automatically, or click Reconnect to load the latest data now.</template>
                <template v-else-if="status === 'error'">{{ error }}</template>
                <template v-else>Currently saved to your Google Drive.</template>
              </p>
              <HelpTooltip label="How Google Drive sync works">
                Your expenses are in a hidden app folder in your Drive, so they show up on any device where you sign
                in. If you sign out, a copy stays in this browser. Anything you add, edit, or delete while signed out
                is uploaded the next time you sign in.
              </HelpTooltip>
            </div>
            <div class="flex flex-wrap items-center gap-3">
              <button v-if="status === 'expired'" type="button" :class="smallButtonClass" @click="emit('sign-in')">
                Reconnect
              </button>
              <button v-if="status === 'error'" type="button" :class="smallButtonClass" @click="emit('retry')">
                Retry
              </button>
              <button type="button" :class="smallButtonClass" :disabled="isBusy" @click="emit('sign-out')">
                Sign out
              </button>
            </div>
          </div>
        </template>
      </div>

      <p class="mb-5 text-sm text-gray-300">
        Your expenses are saved to a hidden app folder in your own Google Drive, sent straight from this browser.
        Nobody else, including the developer of this app, can see them.
      </p>

      <template v-if="status === 'local'">
        <p class="mb-3 text-sm text-gray-300">
          <span class="font-medium">One-time setup, about 10 minutes.</span> It's free and doesn't need a credit card.
          Open each step for the exact clicks.
        </p>

        <ol class="mb-6 space-y-2 text-sm">
          <li v-for="(step, index) in steps" :key="index">
            <details class="group rounded-lg border-2 border-gray-800 open:bg-black/20">
              <summary
                class="flex cursor-pointer list-none items-center gap-3 px-4 py-2.5 font-medium hover:bg-gray-800/50 rounded-md [&::-webkit-details-marker]:hidden">
                <span
                  class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-gray-700 text-xs text-gray-400">
                  {{ index + 1 }}
                </span>
                <span class="flex-1">{{ step.title }}</span>
                <ChevronDownIcon class="w-4 h-4 text-gray-400 transition-transform group-open:rotate-180" />
              </summary>

              <div class="space-y-2 px-4 pb-4 pt-1 text-gray-300">
                <a v-if="step.link" :href="step.link.href" target="_blank" rel="noopener noreferrer"
                  class="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 underline underline-offset-2">
                  {{ step.link.label }}
                  <ArrowTopRightOnSquareIcon class="w-3.5 h-3.5" />
                </a>

                <ul class="list-disc space-y-1.5 pl-5 marker:text-gray-600">
                  <li v-for="(detail, detailIndex) in step.details" :key="detailIndex">
                    <template v-for="(part, partIndex) in boldParts(detail)" :key="partIndex">
                      <strong v-if="part.bold" class="font-semibold text-white">{{ part.text }}</strong>
                      <template v-else>{{ part.text }}</template>
                    </template>
                  </li>
                </ul>

                <div v-if="step.copy" class="flex items-center gap-2 pl-5">
                  <code class="flex-1 min-w-0 truncate px-3 py-1.5 rounded bg-black/40 border border-gray-800 text-xs">{{ step.copy }}</code>
                  <button type="button" @click="copy(step.copy)" :aria-label="`Copy ${step.copy}`"
                    class="inline-flex items-center gap-1 px-2 py-1.5 rounded text-xs text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
                    <CheckIcon v-if="copied === step.copy" class="w-4 h-4 text-green-400" />
                    <ClipboardDocumentIcon v-else class="w-4 h-4" />
                    {{ copied === step.copy ? 'Copied' : 'Copy' }}
                  </button>
                </div>

                <ul v-if="step.detailsAfter" class="list-disc space-y-1.5 pl-5 marker:text-gray-600">
                  <li v-for="(detail, detailIndex) in step.detailsAfter" :key="detailIndex">
                    <template v-for="(part, partIndex) in boldParts(detail)" :key="partIndex">
                      <strong v-if="part.bold" class="font-semibold text-white">{{ part.text }}</strong>
                      <template v-else>{{ part.text }}</template>
                    </template>
                  </li>
                </ul>
              </div>
            </details>
          </li>
        </ol>
      </template>

      <form @submit.prevent="save" class="space-y-2">
        <label for="client-id" class="block text-sm font-medium">Client ID</label>
        <input id="client-id" v-model="input" type="text" autocomplete="off" spellcheck="false"
          placeholder="1234567890-abc123.apps.googleusercontent.com"
          class="w-full text-xs lg:text-sm px-4 py-2.5 border-2 border-gray-800 rounded-lg bg-transparent focus:outline-none focus:border-blue-500 transition-colors placeholder:text-gray-500"
          :class="{ 'border-red-500': !isValid }" />
        <p v-if="!isValid" class="text-sm text-red-500">
          That doesn't look like a client ID. It should end in .apps.googleusercontent.com
        </p>
        <p class="text-xs text-gray-400">
          Stored only in this browser. Changing it signs you out of the current Google account.
        </p>

        <div class="flex gap-3 sm:gap-4 justify-end pt-3">
          <button type="button" @click="emit('close')" :class="buttonClass">Cancel</button>
          <button type="submit" :disabled="!canSave" :class="buttonClass">Save</button>
        </div>
      </form>
    </div>
  </div>
</template>
