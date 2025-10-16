#!/bin/bash

# Script to protect client pages with subscription guard
# This wraps client components in a server component that checks subscription

PAGES=("ortho" "ergo" "kine")

for page in "${PAGES[@]}"; do
  PAGE_DIR="app/[locale]/(app)/$page"

  echo "🔒 Protecting $page page..."

  # Rename page.tsx to client-page.tsx
  if [ -f "$PAGE_DIR/page.tsx" ]; then
    mv "$PAGE_DIR/page.tsx" "$PAGE_DIR/client-page.tsx"
    echo "  ✅ Renamed page.tsx to client-page.tsx"
  fi

  # Create new page.tsx wrapper
  cat > "$PAGE_DIR/page.tsx" << 'EOF'
import { ProtectedClientPage } from '@/components/subscription/protected-client-page'
import ClientPage from './client-page'

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  return (
    <ProtectedClientPage locale={locale}>
      <ClientPage />
    </ProtectedClientPage>
  )
}
EOF

  # Replace ClientPage with proper name
  COMPONENT_NAME="${page^}ClientPage"  # Capitalize first letter
  sed -i '' "s/ClientPage/${COMPONENT_NAME}/g" "$PAGE_DIR/page.tsx"

  echo "  ✅ Created protected wrapper"
  echo ""
done

echo "🎉 All client pages protected!"
