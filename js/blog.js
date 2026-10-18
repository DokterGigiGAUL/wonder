    <!-- Scripts -->
    <script>
      const BLOG_SITE = "doktergigigaul.wordpress.com";
      const BLOG_API =
        "https://public-api.wordpress.com/rest/v1.1/sites/" +
        BLOG_SITE +
        "/posts/?number=4&fields=ID,title,excerpt,URL,date,featured_image";

      // Ubah HTML dari WordPress menjadi teks biasa (tanpa link "Continue reading")
      function teksBersih(html) {
        const doc = new DOMParser().parseFromString(html, "text/html");
        doc.querySelectorAll("a").forEach((a) => a.remove());
        return doc.body.textContent.trim();
      }

      function pesan(teks) {
        const list = document.getElementById("blog-list");
        list.innerHTML = "";
        const p = document.createElement("p");
        p.className = "blog-message";
        p.textContent = teks;
        list.appendChild(p);
      }

      fetch(BLOG_API)
        .then((res) => res.json())
        .then((data) => {
          if (!data.posts || data.posts.length === 0) {
            pesan("Belum ada artikel.");
            return;
          }
          const list = document.getElementById("blog-list");
          list.innerHTML = "";

          data.posts.forEach((post) => {
            const card = document.createElement("a");
            card.className = "latest-card blog-card";
            card.href = post.URL;
            card.target = "_blank";
            card.rel = "noopener";

            // Gambar utama (kalau tidak ada, tampil kotak abu-abu)
            let thumb;
            if (post.featured_image) {
              thumb = document.createElement("img");
              thumb.src = post.featured_image;
              thumb.alt = "";
              thumb.loading = "lazy";
            } else {
              thumb = document.createElement("div");
            }
            thumb.className = "latest-thumb";

            const info = document.createElement("div");
            info.className = "latest-info";

            const judul = document.createElement("h3");
            judul.className = "latest-title";
            judul.textContent = teksBersih(post.title);

            const tanggal = document.createElement("span");

            tanggal.className = "blog-date";
            tanggal.textContent = new Date(post.date).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
            });

            const ringkasan = document.createElement("p");
            ringkasan.className = "latest-description";
            ringkasan.textContent = teksBersih(post.excerpt);

            info.append(judul, tanggal, ringkasan);

            const panah = document.createElement("div");
            panah.className = "latest-arrow";
            panah.textContent = "›";

            card.append(thumb, info, panah);
            list.appendChild(card);
          });
        })
        .catch(() => pesan("Artikel belum dapat dimuat. Silakan coba lagi nanti."));
    </script>
