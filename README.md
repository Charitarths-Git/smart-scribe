# Smart Scribes

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=nextdotjs" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind-3-38B2AC?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Python-3.10-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python" />
  <img src="https://img.shields.io/badge/Supabase-Auth%20%26%20Storage-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
</p>

<p align="center">
  <img src="https://storage.googleapis.com/smartscribe_input/courses/ic-112/lectures/-1-1761663067632/Animations/demomomom.gif" width="720" alt="Demo Animation">
</p>



An AI-powered platform that enhances lectures with multimodal processing, intelligent summarization, Q&A generation, and interactive dashboards.

<div align="center">

[View Demo ▶️](https://youtu.be/G7zEb9On5KI?si=vq9e8IUx18uWCsqy) · 
[Slides 📋](https://drive.google.com/file/d/1ddnYoN5SRydPX6gg-2T6K_LbyNhOXlyg/view?usp=drive_link) · 
[Docs 📖](https://drive.google.com/file/d/1QU8vdC-f3JLUmVnEqb8MRGlvGCneVFrA/view) · 
[Install Guide 🛠️](https://docs.google.com/document/d/12SVAEacqcgggpBd9ZEuPtTzkk854s6yFGcVeqSDfwHc/edit?usp=drive_link)


</div>

<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/water.png" alt="divider" />

## 🧭 Table of Contents

- **Overview**
- **Quick Links**
- **Demo & Animations**
- **Features**
- **Architecture**
- **Folder Structure**
- **Installation**
- **Development**
- **Documentation**
- **Roadmap**
- **Contributing**
- **License**

## 🚀 Overview

Smart Scribes transforms traditional lectures into dynamic, searchable, and interactive experiences by fusing video, audio, and document understanding with a modern web application.

## 🔗 Quick Links

- **YouTube Demo**: `https://youtu.be/mock_smart_scribes_demo`
- **Presentation (PPT/PDF)**: `https://drive.google.com/file/d/mock_presentation/view`
- **Documentation Hub**: `https://docs.smart-scribes.mock`
- **Installation Guide**: `https://docs.smart-scribes.mock/install`

<details>
  <summary><b>What is Smart Scribes? (click to expand)</b></summary>

  Smart Scribes is a multimodal learning assistant. It analyzes lecture videos, audio, and slides to produce summaries, Q&A, and interactive study aides, delivered through a polished Next.js app.

</details>

## 🎬 Demo & Example Animations

<div align="center">

[![Watch the Demo](https://img.youtube.com/vi/mock_smart_scribes_demo/0.jpg)](https://youtu.be/mock_smart_scribes_demo)

</div>

<p align="center">
  <img src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExaGVyZXNsaWRlZ2lm/13HgwGsXF0aiGY/giphy.gif" alt="Example Animation 1" width="280" />
  <img src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdGFicy8x/26BRuo6sLetdllPAQ/giphy.gif" alt="Example Animation 2" width="280" />
  <img src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdHJhbnNpdGlvbnMv/3oEduO9GZcY0S0bGDu/giphy.gif" alt="Example Animation 3" width="280" />
</p>

> Replace the mock demo URL and GIFs with your actual YouTube/video assets. You can also link to generated animations in `Python_Codes/smart_scribes_animations/`.

<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png" alt="divider" />

## 🎯 Features

- **Multimodal Understanding**: Fuse video, audio, and PDFs for rich insights
- **Lecture Summarization**: Generate concise overviews and key points
- **Q&A Generation**: Create questions and answers from lecture content
- **Slides Management**: Upload and manage slides with processing status
- **Student & Professor Dashboards**: Tailored workflows and tools
- **Planning Mode**: Structured learning plans per lecture/topic

## 🏗️ Architecture (High Level)

- **Frontend**: Next.js (App Router) + TypeScript + Tailwind + shadcn/ui
- **APIs**: Next.js Route Handlers under `Web-Application/app/api/*`
- **Storage/DB**: Supabase (auth, storage) — see `Web-Application/lib/supabase.ts`
- **Python Pipelines**: Multimodal embeddings, frames/audio extraction, PDF matching

<details>
  <summary><b>Architecture Diagram (placeholder)</b></summary>

  <p align="center">
    <img src="https://via.placeholder.com/900x420?text=Smart+Scribes+Architecture" alt="Architecture Diagram" />
  </p>

</details>

## 📁 Folder Structure (Updated)

```
Smart-Scribes/
├── Model Training NoteBooks/
│   └── train1.ipynb
├── Python_Codes/
│   ├── all_data.txt
│   ├── audio_embeddings.npy
│   ├── audio_embeddings.py
│   ├── audio_full/
│   │   └── audio.mp3
│   ├── book/
│   │   └── LectureCh10.pdf
│   ├── book_embeddings/
│   │   ├── static_verb_list_embeddings.npy
│   │   └── Stative_Verbs_List_embeddings.npy
│   ├── cleaning.py
│   ├── create_json.py
│   ├── frames_embeddings.py
│   ├── frames_temp/
│   │   ├── frame_00001.png ...
│   ├── fused_final.npy
│   ├── google_storage_code.py
│   ├── lastjson.py
│   ├── manim2.py
│   ├── MultiModal/
│   │   ├── __init__.py
│   │   ├── generate.py
│   │   ├── lecture_to_bookmatch.py
│   │   └── pdf_embedding.py
│   ├── output/
│   │   └── LectureCh10_embeddings.npy
│   ├── pipeline_functions.py
│   ├── pipeline.py
│   ├── smart_scribes_animations/
│   │   ├── anim_01_acknowledgement.mp4
│   │   ├── anim_02_concluding_remarks.mp4
│   │   └── anim_03_expressing_gratitude.mp4
│   ├── test.py
│   ├── UploadTOFrontend.py
│   ├── video_embeddings.npy
│   └── video_full/
│       └── video.mp4
├── Web-Application/
│   ├── app/
│   │   ├── api/
│   │   │   ├── chat/route.ts
│   │   │   ├── qna/
│   │   │   │   ├── generate/route.ts
│   │   │   │   └── topics/route.ts
│   │   │   └── upload/
│   │   │       ├── init/route.ts
│   │   │       ├── route.ts
│   │   │       └── slides/... (Next.js route)
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── src/
│   │   ├── components/ (UI + features)
│   │   ├── data/
│   │   ├── guidelines/
│   │   ├── lib/
│   │   ├── styles/
│   │   └── types/
│   ├── package.json
│   └── next.config.js
├── requirements.txt
└── README.md
```

> The structure above reflects the current repository, including Python multimodal pipelines and the Next.js app with API routes.

## 🧪 Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, Radix Primitives
- **Animations**: Framer Motion (UI), GIF/MP4 assets in README
- **Backend/AI**: Python 3.10+, NumPy + custom pipelines (embeddings, frames/audio extraction)
- **Infra**: Supabase (auth/storage), Vercel (recommended) or Node hosting

## 🛠️ Installation

### Prerequisites
- Node.js 18+
- npm (or pnpm/yarn)
- Python 3.10+
- Git

### Clone
```bash
git clone https://github.com/Kartavya728/Smart-Scribes.git
cd Smart-Scribes
```

### Web Application
```bash
cd Web-Application
npm install
npm run dev
# http://localhost:3000
```

### Python Environment
```bash
python -m venv venv
# Windows PowerShell
venv\Scripts\Activate.ps1
# macOS/Linux
# source venv/bin/activate
pip install -r requirements.txt
```

<details>
  <summary><b>Optional: Sample data & embeddings</b></summary>

  Place your lecture video under `Python_Codes/video_full/video.mp4` and slides/PDFs under `Python_Codes/book/`. Use the scripts in `Python_Codes/` to generate embeddings and frames.

</details>

## 🧰 Development

### Available Scripts (Web)

- `npm run dev` — Start development server
- `npm run build` — Build for production
- `npm run start` — Start production server
- `npm run lint` — Run ESLint

### API Routes (Web-Application/app/api)

- `chat/route.ts` — Chat endpoints
- `qna/generate/route.ts` — Generate Q&A
- `qna/topics/route.ts` — Topics metadata
- `upload/init/route.ts` and `upload/route.ts` — Upload handlers

## 📚 Documentation

- **📘 Docs Hub:** [View Documentation](https://drive.google.com/file/d/1QU8vdC-f3JLUmVnEqb8MRGlvGCneVFrA/view)
- **🎥 Video Guide:** [Watch on YouTube](https://youtu.be/G7zEb9On5KI?si=vq9e8IUx18uWCsqy)
- **🧰 Installation Guide:** [Open Google Doc](https://docs.google.com/document/d/12SVAEacqcgggpBd9ZEuPtTzkk854s6yFGcVeqSDfwHc/edit?usp=drive_link)
- **📊 Project Overview (PPT):** [View Presentation](https://drive.google.com/file/d/1ddnYoN5SRydPX6gg-2T6K_LbyNhOXlyg/view?usp=drive_link)
- **🧠 API Reference:**  
  - [Google Cloud API Docs](https://docs.cloud.google.com/apis/docs/overview)  
  - [Supabase API Docs](https://supabase.com/docs/guides/api)


## 🔮 Roadmap

- [x] Next.js web application foundation
- [x] Component library & dashboards
- [ ] Multimodal pipeline integration (Python → Web)
- [ ] Summarization + Q&A at scale
- [ ] Slides pipeline UX + progress tracking
- [ ] Analytics & export

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit: `git commit -m "feat: add your feature"`
4. Push: `git push origin feat/your-feature`
5. Open a Pull Request

### Code Guidelines
- Consistent TypeScript and Python styles
- Lint before PRs; add tests where applicable
- Keep components modular and typed

## 📝 License

IIT Mandi - IHub Hackathon

## 🙌 Acknowledgments

- Radix UI, shadcn/ui, Tailwind CSS, Next.js
- Supabase for auth/storage utilities

<p align="center">
  <img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/solar.png" alt="divider" />
  <br/>
  <i>Built with ❤️ for the future of education</i>
</p>
