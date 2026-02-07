# Portfolio — Yusuf Akin

Modern, tek sayfa portfolyo. GitHub projeleri otomatik çekilir, proje detayında README gösterilir.

## Çalıştırma (yerel)

```bash
npm install
npm start
```

Tarayıcıda: **http://localhost:3000**

## Statik hosting (dist yükleyerek)

Sunucuda Node çalıştırmıyorsan, sadece **dist** klasörünü yükle:

1. **Build al:** `npm run build`  
   Bu komut dist’i oluşturur ve içine **repos.json** ile **config.json** yazar (GitHub’dan projeler ve linkler).
2. **dist** içeriğini (index.html, css/, js/, public/, repos.json, config.json) hostinge yükle.

Site açıldığında önce `/api/repos` ve `/api/config` denenir; 404 olursa **repos.json** ve **config.json** kullanılır. README’ler proje detayında GitHub API üzerinden tarayıcıda çekilir.

## Ortam Değişkenleri (.env)

| Değişken | Açıklama |
|----------|----------|
| `GITHUB_TOKEN` | GitHub Personal Access Token (repo okuma) |
| `GITHUB_USERNAME` | GitHub kullanıcı adı |
| `LINKEDIN_URL` | LinkedIn profil linki |
| `INSTAGRAM_URL` | Instagram profil linki |
| `EMAIL` | E-posta adresi (mailto otomatik eklenir) |
| `PORT` | Sunucu portu (varsayılan: 3000) |

`.env.example` dosyasını referans alabilirsiniz.

## Özellikler

- **Projeler**: GitHub’daki public repolar otomatik listelenir (fork’lar hariç).
- **Proje detay**: Karta tıklayınca modal açılır, README Markdown olarak render edilir.
- **Güncelle**: Sağ üstteki “Güncelle” butonu cache’i temizleyip projeleri yeniden çeker.
- **Cron**: Her gün gece yarısı (Europe/Istanbul) projeler otomatik yenilenir.
- **GitHub Webhook**: Repo’da push olduğunda güncelleme için `POST /api/webhook/github` kullanılabilir.

### Webhook kurulumu (isteğe bağlı)

1. GitHub repo → Settings → Webhooks → Add webhook
2. Payload URL: `https://your-domain.com/api/webhook/github`
3. Content type: `application/json`
4. Event: “Just the push event”
5. Secret boş bırakılabilir (veya ekleyip sunucuda doğrulama ekleyebilirsiniz)

## Vercel’e deploy (yusufakin.com.tr için)

Site statik hostta (sadece HTML/CSS/JS) çalışıyorsa `/api/config` ve `/api/repos` 404 verir. **Vercel** kullanırsan aynı domain’de API de çalışır:

1. Projeyi GitHub’a push et.
2. [vercel.com](https://vercel.com) → Import Project → bu repo’yu seç.
3. **Environment Variables** ekle: `GITHUB_TOKEN` (token’ın kendisi).
4. Deploy et; domain’i **yusufakin.com.tr** yap (Vercel’de Domain ayarı).

Proje kökünde `api/` ve `lib/` var; Vercel bunları serverless function olarak çalıştırır. `vercel.json` SPA için gerekli rewrite’ları içerir.

## Dosya yapısı

```
portfolio/
├── index.html      # Ana sayfa
├── css/            # Stiller
├── js/             # Frontend
├── public/         # Profil fotoğrafı vb.
├── api/            # Vercel serverless (api/config, api/repos, readme)
├── lib/            # GitHub helper (api ile ortak)
├── server.js       # Yerel çalıştırma (npm start)
├── vercel.json     # Vercel rewrite’lar
└── .env / .env.example
```
