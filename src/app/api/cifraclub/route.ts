import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");
  const mode = searchParams.get("mode") || "single"; // "single" ou "list"

  if (!url) {
    return NextResponse.json({ error: "A URL é obrigatória" }, { status: 400 });
  }

  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname;
    if (hostname !== "cifraclub.com.br" && !hostname.endsWith(".cifraclub.com.br")) {
      return NextResponse.json({ error: "Apenas URLs do domínio cifraclub.com.br são permitidas." }, { status: 400 });
    }
  } catch (e) {
    return NextResponse.json({ error: "A URL informada é inválida." }, { status: 400 });
  }

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7"
      }
    });

    if (!res.ok) {
      return NextResponse.json({ error: `Erro ao buscar página: Status ${res.status}` }, { status: res.status });
    }

    const html = await res.text();

    if (mode === "list") {
      // Extrair lista de músicas de uma página de artista ou playlist
      let artistSlug = "";
      try {
        const urlObj = new URL(url);
        const pathParts = urlObj.pathname.split("/").filter(Boolean);
        if (pathParts.length > 0) {
          artistSlug = pathParts[0];
        }
      } catch (e) {}

      const songs: { title: string; url: string }[] = [];
      const seen = new Set<string>();

      let match;
      if (artistSlug && !["playlist", "playlists", "user", "contribuir"].includes(artistSlug)) {
        const regex = new RegExp(`<a[^>]*href=["'](?:https:\\/\\/www\\.cifraclub\\.com\\.br)?\\/${artistSlug}\\/([^"'/]+)\\/["'][^>]*>([\\s\\S]*?)<\/a>`, "gi");
        while ((match = regex.exec(html)) !== null) {
          const slug = match[1];
          const block = match[2];
          
          if (["letras", "fotos", "playlists", "cifras", "discografia", "biografia", "videos", "novidades", "integrantes"].includes(slug)) {
            continue;
          }

          const titleMatch = block.match(/class=["'][^"']*primaryLabel[^"']*["'][^>]*>(?:<span[^>]*>)?([^<]+)/i);
          const songTitle = titleMatch ? titleMatch[1].trim() : slug.replace(/-/g, " ");

          const fullUrl = `https://www.cifraclub.com.br/${artistSlug}/${slug}/`;
          if (!seen.has(fullUrl)) {
            seen.add(fullUrl);
            songs.push({ title: songTitle, url: fullUrl });
          }
        }
      } else {
        const regex = /<a[^>]*href=["'](?:https:\/\/www\.cifraclub\.com\.br)?\/([^"'/]+)\/([^"'/]+)\/["'][^>]*>([\s\S]*?)<\/a>/gi;
        while ((match = regex.exec(html)) !== null) {
          const artist = match[1];
          const slug = match[2];
          const block = match[3];

          if (["cifraclub", "privacidade", "playlist", "playlists", "user", "contribuir"].includes(artist)) {
            continue;
          }
          if (["letras", "fotos", "playlists", "cifras", "discografia", "biografia", "videos", "novidades", "integrantes"].includes(slug)) {
            continue;
          }

          const titleMatch = block.match(/class=["'][^"']*primaryLabel[^"']*["'][^>]*>(?:<span[^>]*>)?([^<]+)/i);
          if (titleMatch) {
            const songTitle = titleMatch[1].trim();
            const fullUrl = `https://www.cifraclub.com.br/${artist}/${slug}/`;
            if (!seen.has(fullUrl)) {
              seen.add(fullUrl);
              songs.push({ title: songTitle, url: fullUrl });
            }
          }
        }
      }

      return NextResponse.json({ songs });
    } else {
      // Extrair detalhes de uma única música
      // Título e Artista
      const titleTagMatch = html.match(/<title>([^<]+)<\/title>/i);
      let songTitle = "";
      let artistName = "";

      if (titleTagMatch) {
        const parts = titleTagMatch[1].split(" - ");
        if (parts.length >= 2) {
          songTitle = parts[0].trim();
          artistName = parts[parts.length - 2].trim();
          // Remove numeração de hinos (ex: "Porque Ele Vive - 545" vira "Porque Ele Vive")
          songTitle = songTitle.replace(/\s*-\s*\d+$/, "");
        } else {
          songTitle = titleTagMatch[1].replace(" - Cifra Club", "").trim();
        }
      }

      if (!songTitle) {
        const h1Match = html.match(/<h1 class="t1">([\s\S]*?)<\/h1>/i);
        songTitle = h1Match ? h1Match[1].replace(/<[^>]+>/g, "").trim() : "Música Sem Título";
      }
      if (!artistName) {
        const artistMatch = html.match(/<h2 class="t3">\s*<a[^>]*>([\s\S]*?)<\/a>\s*<\/h2>/i);
        artistName = artistMatch ? artistMatch[1].replace(/<[^>]+>/g, "").trim() : "Artista Desconhecido";
      }

      // Tom da música
      const tomMatch = html.match(/title="alterar o tom da cifra">\s*([A-G][#b]?m?)\s*<\/a>/i)
                    || html.match(/id=["']cifra_tom["'][^>]*>\s*([A-G][#b]?m?)\s*<\/button>/i)
                    || html.match(/Tom:?\s*<b>([^<]+)<\/b>/i);
      const key = tomMatch ? tomMatch[1].trim() : "C";

      // BPM
      const bpmMatch = html.match(/bpm:?\s*<b>(\d+)<\/b>/i)
                    || html.match(/bpm:\s*(\d+)/i)
                    || html.match(/BPM:?\s*(\d+)/i);
      const bpm = bpmMatch ? parseInt(bpmMatch[1]) : 80;

      // Cifra
      const preMatch = html.match(/<pre[^>]*>([\s\S]*?)<\/pre>/i);
      let cifraText = "";

      if (preMatch) {
        let preHtml = preMatch[1];
        preHtml = preHtml.replace(/<b>([\s\S]*?)<\/b>/gi, "[$1]");
        cifraText = preHtml.replace(/<\/?[a-z][a-z0-9]*[^>]*>/gi, "");
        
        cifraText = cifraText
          .replace(/&nbsp;/g, " ")
          .replace(/&amp;/g, "&")
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .replace(/&quot;/g, '"')
          .replace(/&#039;/g, "'");
      }

      return NextResponse.json({
        title: songTitle,
        artist: artistName,
        key,
        bpm,
        cifra: cifraText
      });
    }
  } catch (err: any) {
    return NextResponse.json({ error: `Erro interno no servidor: ${err.message}` }, { status: 500 });
  }
}
