#!/bin/bash
# Builds five voice-over demos as full 15 s soundtracks (voice + music + effects) in docs/voice-demos/.
# Each demo regenerates public/audio/narration/ and then renders the audio-only preview, so the files
# sound exactly like the finished video. Run from the project root:
#   KOKORO_DIR=/path/to/kokoro/files bash scripts/voice_demos.sh
# Afterwards, re-run the demo you choose (see the table in README.md) before `npm run render`.
set -euo pipefail
mkdir -p docs/voice-demos

demo() { # name voice pace pitch brand-phonemes to-phonemes brand-speed
  echo "== $1"
  NARRATION_VOICE="$2" NARRATION_PACE="$3" NARRATION_PITCH="$4" BRAND_PHONEMES="$5" TO_PHONEMES="$6" BRAND_SPEED="$7" \
    python3 scripts/make_narration.py
  npx remotion render AsematicLabsLaunch "docs/voice-demos/$1.m4a" --codec=aac --log=error
}

# Pronunciation settings per voice were chosen by checking that an offline speech recogniser hears
# "Asematic Labs" in both brand lines of the finished 15 s soundtrack (voice + music + effects).
demo "demo-2-bright-youthful"   "hf_alpha"                    1.12 2 "ɐsˈɛmætɪk" "tʊ"  0.95
demo "demo-3-warm-polished"     "hf_alpha:0.7+af_nova:0.3"   1.1  1 "ɐsˈɛmætɪk" "tʊ"  0.9
demo "demo-4-fresh-lively"      "hf_alpha:0.7+af_jessica:0.3" 1.1  1 "ɐsˈɛmætɪk" "tʊ"  0.95
demo "demo-5-confident-polished" "hf_alpha:0.7+bf_emma:0.3"  1.08 1 "ɐsˈɛmætɪk" "tuː" 0.95
# Demo 1 runs last so the project is left with it as the current narration.
demo "demo-1-energetic-indian"  "hf_alpha"                   1.08 1 "ɐsˈɛmætɪk" "tuː" 0.95
