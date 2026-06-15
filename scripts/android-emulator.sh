#!/usr/bin/env bash
#
# Sobe um emulador Android, espera o boot e instala o APK de debug do Focatto.
# Não precisa do Android Studio — apenas do Android SDK (emulator + platform-tools)
# e de um AVD criado. Uso:
#
#   npm run mobile:emulator              # usa o primeiro AVD disponível
#   npm run mobile:emulator -- Pixel_7   # usa um AVD específico
#
set -euo pipefail

# Resolve a raiz do SDK.
SDK="${ANDROID_HOME:-${ANDROID_SDK_ROOT:-$HOME/Android/Sdk}}"
EMULATOR="$SDK/emulator/emulator"
ADB="$SDK/platform-tools/adb"

if [[ ! -x "$EMULATOR" ]]; then
  echo "✗ emulator não encontrado em $EMULATOR"
  echo "  Defina ANDROID_HOME e instale: sdkmanager \"emulator\" \"platform-tools\""
  exit 1
fi

# Lista AVDs e escolhe o alvo (argumento ou o primeiro).
AVD="${1:-}"
if [[ -z "$AVD" ]]; then
  AVD="$("$EMULATOR" -list-avds | head -n1 || true)"
fi

if [[ -z "$AVD" ]]; then
  echo "✗ Nenhum AVD encontrado. Crie um (uma vez):"
  echo "    sdkmanager \"system-images;android-35;google_apis;x86_64\""
  echo "    avdmanager create avd -n Focatto_API35 -k \"system-images;android-35;google_apis;x86_64\" -d pixel_7"
  echo "  Depois rode novamente: npm run mobile:emulator"
  exit 1
fi

# Sobe o emulador se ainda não houver um dispositivo online.
if ! "$ADB" devices | grep -qE "emulator-[0-9]+\s+device"; then
  echo "▶ Iniciando emulador: $AVD"
  "$EMULATOR" -avd "$AVD" -netdelay none -netspeed full >/dev/null 2>&1 &
else
  echo "▶ Emulador já em execução, reaproveitando."
fi

echo "⏳ Aguardando o emulador conectar..."
"$ADB" wait-for-device

echo "⏳ Aguardando o boot finalizar..."
until [[ "$("$ADB" shell getprop sys.boot_completed 2>/dev/null | tr -d '\r')" == "1" ]]; do
  sleep 2
done

# Gera o APK de debug se ainda não existir.
APK="android/app/build/outputs/apk/debug/app-debug.apk"
if [[ ! -f "$APK" ]]; then
  echo "🔨 Gerando APK de debug..."
  npm run mobile:android:debug
fi

echo "📦 Instalando $APK"
"$ADB" install -r "$APK"

echo "🚀 Abrindo o app..."
"$ADB" shell monkey -p br.com.focatto.app -c android.intent.category.LAUNCHER 1 >/dev/null 2>&1 || true

echo "✓ Pronto! Focatto rodando no emulador $AVD."
