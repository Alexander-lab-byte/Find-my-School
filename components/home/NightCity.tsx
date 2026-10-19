"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { CitySchool } from "@/lib/schools";
import { schoolNames } from "@/lib/labels";
import { Icon } from "@/components/common/Icon";

/*
 * Homepage hero: Ulaanbaatar at night as a live 3D point cloud. Every school
 * with coordinates is an amber beam of light at its real position. Pick a
 * district and the camera flies there; tap a beam to inspect that school.
 *
 * three.js is loaded on the client only, after the page is interactive, so the
 * hero text is server-rendered and readable even before (or without) WebGL.
 */

// Only schools inside this box are drawn; anything else (other aimags) is too far away.
const BOUNDS = { latMin: 47.84, latMax: 47.97, lonMin: 106.74, lonMax: 107.08 };
const LAT0 = 47.905;
const LON0 = 106.905;
const KX = 67; // scene units per degree of longitude (≈ km scale at this latitude)
const KZ = 100; // scene units per degree of latitude
const toX = (lon: number) => (lon - LON0) * KX;
const toZ = (lat: number) => -(lat - LAT0) * KZ;

// Stylised landforms: Bogd Khan mountain to the south, hills to the north, the Tuul river.
function terrainY(lat: number, lon: number) {
  let y = 0;
  if (lat < 47.878) y += Math.pow((47.878 - lat) * 60, 1.6) * (0.8 + 0.3 * Math.sin(lon * 900));
  if (lat > 47.935) y += (lat - 47.935) * 40 * (0.7 + 0.3 * Math.sin(lon * 700));
  return y;
}
const riverLat = (lon: number) => 47.886 - 0.006 * Math.sin((lon - 106.82) * 38);

type Pinned = CitySchool & { latitude: number; longitude: number };
type CamGoal = { tx: number; tz: number; rad: number; h: number };
const HOME_VIEW: CamGoal = { tx: 0, tz: 0, rad: 12.5, h: 7.5 };

export function NightCity({ schools }: { schools: CitySchool[] }) {
  const t = useTranslations("City");
  const tPlace = useTranslations("Place");
  const tCurriculum = useTranslations("CurriculumShort");
  const locale = useLocale();

  const pinned = useMemo(
    () =>
      schools.filter(
        (s): s is Pinned =>
          s.latitude != null &&
          s.longitude != null &&
          s.latitude > BOUNDS.latMin &&
          s.latitude < BOUNDS.latMax &&
          s.longitude > BOUNDS.lonMin &&
          s.longitude < BOUNDS.lonMax,
      ),
    [schools],
  );

  // Districts with at least one school, centred on their schools' real positions.
  const districts = useMemo(() => {
    const map = new Map<string, { count: number; lat: number; lon: number; n: number }>();
    for (const s of schools) {
      if (!s.district) continue;
      const d = map.get(s.district) ?? { count: 0, lat: 0, lon: 0, n: 0 };
      d.count += 1;
      if (s.latitude != null && s.longitude != null) {
        d.lat += s.latitude;
        d.lon += s.longitude;
        d.n += 1;
      }
      map.set(s.district, d);
    }
    return [...map.entries()]
      .map(([name, d]) => ({
        name,
        count: d.count,
        center: d.n ? { lat: d.lat / d.n, lon: d.lon / d.n } : null,
      }))
      .sort((a, b) => b.count - a.count);
  }, [schools]);

  const [district, setDistrict] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const tagRefs = useRef(new Map<string, HTMLSpanElement>());
  // Values the render loop reads without re-running the effect.
  const live = useRef({ district: null as string | null, selected: null as string | null, goal: HOME_VIEW });

  const placeName = (name: string) => (tPlace.has(name) ? tPlace(name) : name);
  const nameOf = (s: CitySchool) => schoolNames(s, locale).primary;
  const shortName = (s: CitySchool) =>
    nameOf(s).replace(/\s+(School of Ulaanbaatar|International School|School|олон улсын сургууль|сургууль)$/i, "");

  function flyTo(goal: CamGoal) {
    live.current.goal = goal;
  }

  function chooseDistrict(name: string | null) {
    setDistrict(name);
    setSelected(null);
    live.current.district = name;
    live.current.selected = null;
    const d = districts.find((x) => x.name === name);
    flyTo(d?.center ? { tx: toX(d.center.lon), tz: toZ(d.center.lat), rad: 8.5, h: 5.2 } : HOME_VIEW);
  }

  function select(id: string | null) {
    setSelected(id);
    live.current.selected = id;
    const s = pinned.find((x) => x.id === id);
    if (s) flyTo({ tx: toX(s.longitude), tz: toZ(s.latitude), rad: 7, h: 4.2 });
  }

  // ---- three.js scene -------------------------------------------------------
  useEffect(() => {
    const canvas = canvasRef.current;
    const hero = heroRef.current;
    if (!canvas || !hero) return;
    let disposed = false;
    let cleanup = () => {};

    import("three").then((THREE) => {
      if (disposed) return;
      let renderer: InstanceType<typeof THREE.WebGLRenderer>;
      try {
        renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
      } catch {
        return; // No WebGL: the CSS backdrop behind the canvas stays.
      }
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const small = window.innerWidth < 720;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, small ? 1.5 : 2));
      renderer.setClearColor(0x070b16, 1);
      const scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(0x070b16, 0.055);
      const camera = new THREE.PerspectiveCamera(small ? 55 : 42, 1, 0.1, 200);

      // City point cloud: brighter towards the centre, the river in ice blue,
      // Peace Avenue and Chinggis Avenue as warm lines.
      const step = small ? 0.0024 : 0.0016;
      const pos: number[] = [];
      const col: number[] = [];
      const c = new THREE.Color();
      for (let lat = 47.85; lat <= 47.955; lat += step * 0.67) {
        for (let lon = 106.8; lon <= 107.01; lon += step) {
          const jl = lat + (Math.random() - 0.5) * step * 0.5;
          const jo = lon + (Math.random() - 0.5) * step * 0.5;
          const dc = Math.hypot((jo - 106.917) * 0.67, jl - 47.918) * 30;
          const river = Math.abs(jl - riverLat(jo)) < 0.0022;
          const peace = Math.abs(jl - 47.9175) < 0.0012 && jo > 106.83 && jo < 106.99;
          const chinggis = Math.abs(jo - 106.917) < 0.0016 && jl > 47.885 && jl < 47.918;
          const city = jl > 47.878 && jl < 47.94;
          if (river) c.setRGB(0.35, 0.55, 1);
          else if (peace || chinggis) c.setRGB(1, 0.82, 0.55);
          else if (city) {
            const b = Math.max(0.12, 1 - dc * 0.55) * (0.55 + Math.random() * 0.45);
            c.setRGB(0.55 * b + 0.1, 0.62 * b + 0.12, 0.9 * b + 0.2);
          } else c.setRGB(0.12, 0.16, 0.28);
          pos.push(toX(jo), terrainY(jl, jo), toZ(jl));
          col.push(c.r, c.g, c.b);
        }
      }
      const cityGeo = new THREE.BufferGeometry();
      cityGeo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
      cityGeo.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
      const cityMat = new THREE.PointsMaterial({
        size: small ? 0.06 : 0.045,
        vertexColors: true,
        transparent: true,
        opacity: 0.9,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      scene.add(new THREE.Points(cityGeo, cityMat));

      // Soft round glow used for the foot and tip of each beam.
      const glowCanvas = document.createElement("canvas");
      glowCanvas.width = glowCanvas.height = 64;
      const g = glowCanvas.getContext("2d")!;
      const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, "rgba(255,255,255,1)");
      grad.addColorStop(0.25, "rgba(255,200,120,.9)");
      grad.addColorStop(1, "rgba(255,181,71,0)");
      g.fillStyle = grad;
      g.fillRect(0, 0, 64, 64);
      const glow = new THREE.CanvasTexture(glowCanvas);

      const beamGeo = new THREE.CylinderGeometry(0.025, 0.06, 2.4, 10, 1, true);
      const hitGeo = new THREE.CylinderGeometry(0.35, 0.35, 2.6, 6);
      const hitMat = new THREE.MeshBasicMaterial({ visible: false });
      const disposables: { dispose(): void }[] = [cityGeo, cityMat, glow, beamGeo, hitGeo, hitMat];
      const beams = pinned.map((s, i) => {
        const group = new THREE.Group();
        group.position.set(toX(s.longitude), terrainY(s.latitude, s.longitude), toZ(s.latitude));
        const mat = new THREE.MeshBasicMaterial({
          color: 0xffb547,
          transparent: true,
          opacity: 0.75,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });
        const beam = new THREE.Mesh(beamGeo, mat);
        beam.position.y = 1.2;
        const baseMat = new THREE.SpriteMaterial({ map: glow, color: 0xffb547, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
        const base = new THREE.Sprite(baseMat);
        base.scale.set(0.9, 0.9, 1);
        const topMat = new THREE.SpriteMaterial({ map: glow, color: 0xffe2b0, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
        const top = new THREE.Sprite(topMat);
        top.scale.set(0.35, 0.35, 1);
        top.position.y = 2.4;
        const hit = new THREE.Mesh(hitGeo, hitMat);
        hit.position.y = 1.3;
        hit.userData.id = s.id;
        group.add(beam, base, top, hit);
        scene.add(group);
        disposables.push(mat, baseMat, topMat);
        return { s, group, beam, base, top, hit, mat, phase: i * 1.7 };
      });

      const resize = () => {
        const w = canvas.clientWidth;
        const h = canvas.clientHeight;
        if (!w || !h) return;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        // On wide screens the headline sits on the left, so shift the city to the right.
        if (w >= 1024) camera.setViewOffset(w, h, -w * 0.2, 0, w, h);
        else camera.clearViewOffset();
        camera.updateProjectionMatrix();
      };
      const ro = new ResizeObserver(resize);
      ro.observe(canvas);
      resize();

      // Pointer parallax + tap-to-select (a drag is not a tap).
      const pointer = { x: 0, y: 0 };
      let down: { x: number; y: number } | null = null;
      const ray = new THREE.Raycaster();
      const ndc = new THREE.Vector2();
      const onMove = (e: PointerEvent) => {
        const r = canvas.getBoundingClientRect();
        pointer.x = (e.clientX - r.left) / r.width - 0.5;
        pointer.y = (e.clientY - r.top) / r.height - 0.5;
      };
      const onDown = (e: PointerEvent) => (down = { x: e.clientX, y: e.clientY });
      const onUp = (e: PointerEvent) => {
        if (!down || Math.hypot(e.clientX - down.x, e.clientY - down.y) > 8) return;
        const r = canvas.getBoundingClientRect();
        ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
        ray.setFromCamera(ndc, camera);
        const hit = ray.intersectObjects(beams.map((b) => b.hit))[0];
        select(hit ? (hit.object.userData.id as string) : null);
      };
      canvas.addEventListener("pointermove", onMove);
      canvas.addEventListener("pointerdown", onDown);
      canvas.addEventListener("pointerup", onUp);

      // Scroll pulls the camera down into the city as the hero leaves.
      let heroP = 0;
      const onScroll = () => {
        heroP = Math.min(1, Math.max(0, window.scrollY / hero.offsetHeight));
      };
      window.addEventListener("scroll", onScroll, { passive: true });

      const cam = { ang: 0.6, ...HOME_VIEW };
      const v3 = new THREE.Vector3();
      let clock = 0;
      let raf = 0;
      let running = false;

      const frame = () => {
        raf = requestAnimationFrame(frame);
        clock += 1 / 60;
        const { goal, selected: sel, district: dist } = live.current;
        if (!reduce) cam.ang += 0.0009;
        const k = reduce ? 1 : 0.05;
        cam.tx += (goal.tx - cam.tx) * k;
        cam.tz += (goal.tz - cam.tz) * k;
        cam.rad += (goal.rad - cam.rad) * k;
        cam.h += (goal.h - cam.h) * k;
        const a = cam.ang + pointer.x * 0.35;
        const r = cam.rad * (1 - heroP * 0.25);
        camera.position.set(cam.tx + Math.sin(a) * r, Math.max(1.5, cam.h * (1 - heroP * 0.35) - pointer.y * 1.2), cam.tz + Math.cos(a) * r);
        camera.lookAt(cam.tx, 0.4, cam.tz);

        for (const b of beams) {
          const isSel = b.s.id === sel;
          const near = dist !== null && b.s.district === dist;
          const pulse = reduce ? 1 : 0.8 + 0.2 * Math.sin(clock * 2 + b.phase);
          b.mat.opacity = (isSel ? 1 : near ? 0.95 : dist ? 0.25 : 0.75) * pulse;
          b.mat.color.set(isSel ? 0xffffff : 0xffb547);
          const sc = isSel ? 1.6 : near ? 1.25 : 1;
          b.beam.scale.setScalar(sc);
          b.beam.position.y = 1.2 * sc;
          b.top.position.y = 2.4 * sc;
          b.base.scale.setScalar((isSel ? 1.6 : 0.9) * pulse);
        }
        renderer.render(scene, camera);

        // Keep the HTML name tags pinned to the top of each beam.
        const w = canvas.clientWidth;
        const h = canvas.clientHeight;
        for (const b of beams) {
          const el = tagRefs.current.get(b.s.id);
          if (!el) continue;
          v3.set(b.group.position.x, b.group.position.y + b.top.position.y, b.group.position.z).project(camera);
          const visible = v3.z < 1 && Math.abs(v3.x) < 1.05 && Math.abs(v3.y) < 1.05 && heroP < 0.6;
          el.style.transform = `translate(${((v3.x + 1) / 2) * w}px, ${((1 - v3.y) / 2) * h}px) translate(-50%, -130%)`;
          el.dataset.visible = String(visible && (dist === null || b.s.district === dist || b.s.id === sel));
        }
      };
      const start = () => {
        if (running) return;
        running = true;
        frame();
      };
      const stop = () => {
        running = false;
        cancelAnimationFrame(raf);
      };
      // Only animate while the hero is on screen.
      const io = new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : stop()));
      io.observe(hero);
      setReady(true);

      cleanup = () => {
        stop();
        io.disconnect();
        ro.disconnect();
        window.removeEventListener("scroll", onScroll);
        canvas.removeEventListener("pointermove", onMove);
        canvas.removeEventListener("pointerdown", onDown);
        canvas.removeEventListener("pointerup", onUp);
        disposables.forEach((d) => d.dispose());
        renderer.dispose();
      };
    });

    return () => {
      disposed = true;
      cleanup();
    };
    // The scene is built once per set of schools; selection lives in `live`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pinned]);

  const current = schools.find((s) => s.id === selected) ?? null;
  const currentDistrict = districts.find((d) => d.name === district);

  return (
    <section
      ref={heroRef}
      className="relative isolate flex min-h-[clamp(640px,94svh,900px)] flex-col overflow-hidden bg-background"
    >
      {/* CSS backdrop shown until (or instead of) WebGL. */}
      <div
        aria-hidden
        className={`absolute inset-0 -z-20 transition-opacity duration-1000 ${ready ? "opacity-0" : "opacity-100"}`}
        style={{ background: "radial-gradient(900px circle at 50% 75%, #1a2a52, #070b16 70%)" }}
      />
      <canvas
        ref={canvasRef}
        aria-label={t("canvasAria")}
        role="img"
        className={`absolute inset-0 -z-10 block size-full touch-pan-y transition-opacity duration-1000 ${ready ? "opacity-100" : "opacity-0"}`}
      />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-2/5 bg-gradient-to-b from-transparent to-background" />

      {/* Name tags that follow the beams. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        {pinned.map((s) => (
          <span
            key={s.id}
            ref={(el) => {
              if (el) tagRefs.current.set(s.id, el);
              else tagRefs.current.delete(s.id);
            }}
            data-visible="false"
            className={`absolute left-0 top-0 whitespace-nowrap rounded-md border px-2 py-1 font-mono text-[11px] font-semibold transition-opacity duration-300 data-[visible=false]:opacity-0 ${
              s.id === selected
                ? "border-accent bg-accent text-accent-foreground"
                : "border-[var(--glass-line)] bg-background/70 text-foreground max-md:hidden"
            }`}
          >
            {shortName(s)}
          </span>
        ))}
      </div>

      {/* Inspect panel for the tapped school. */}
      {current && (
        <aside
          aria-live="polite"
          className="glass enter absolute z-10 flex flex-col gap-3 rounded-[1.5rem] p-4 max-md:inset-x-4 max-md:bottom-4 md:right-[max(1.5rem,calc((100vw-72rem)/2+1.5rem))] md:top-6 md:w-80"
        >
          <div className="flex items-start justify-between gap-3">
            <p className="data-label">
              {current.latitude != null && current.longitude != null
                ? `${current.latitude.toFixed(4)}° N · ${current.longitude.toFixed(4)}° E`
                : t("notOnMap")}
            </p>
            <button
              type="button"
              onClick={() => select(null)}
              aria-label={t("close")}
              className="-m-2 rounded-full p-2 text-muted hover:text-foreground"
            >
              <Icon name="x" className="size-4" />
            </button>
          </div>
          <h2 className="font-display text-lg leading-tight">{nameOf(current)}</h2>
          <dl className="grid gap-1.5 text-sm">
            {current.district && (
              <div className="flex justify-between gap-3">
                <dt className="text-muted">{t("district")}</dt>
                <dd className="text-right font-bold">{placeName(current.district)}</dd>
              </div>
            )}
            {current.curriculum.length > 0 && (
              <div className="flex justify-between gap-3">
                <dt className="text-muted">{t("curriculum")}</dt>
                <dd className="text-right font-bold">{current.curriculum.map((c) => tCurriculum(c)).join(" · ")}</dd>
              </div>
            )}
            {current.foundedYear && (
              <div className="flex justify-between gap-3">
                <dt className="text-muted">{t("founded")}</dt>
                <dd className="font-mono font-bold">{current.foundedYear}</dd>
              </div>
            )}
          </dl>
          <Link href={`/school/${current.id}`} className="btn-primary !min-h-[42px] !py-2 text-sm">
            {t("openProfile")}
            <Icon name="arrow-right" className="size-4" />
          </Link>
        </aside>
      )}

      {/* Headline and district finder. Pointer events pass through to the canvas around it. */}
      <div className="pointer-events-none relative mx-auto flex w-full max-w-6xl flex-1 flex-col justify-end gap-5 px-4 pb-10 pt-24 sm:px-6 [&>*]:pointer-events-auto">
        <p className="data-label flex flex-wrap gap-x-4 gap-y-1">
          <span>{t("coords")}</span>
          <span>{t("city")}</span>
          <span>{t("count", { total: schools.length, onMap: pinned.length })}</span>
        </p>
        <h1 className="max-w-[11ch] font-display text-[clamp(2.6rem,9vw,7.5rem)] font-extrabold leading-[0.95] tracking-tight [&_em]:not-italic [&_em]:text-accent">
          {t.rich("title", { em: (chunks) => <em>{chunks}</em> })}
        </h1>
        <p className="max-w-[46ch] text-base text-muted sm:text-lg">{t("lede")}</p>

        <div className="glass flex max-w-2xl flex-col gap-3 rounded-[1.6rem] p-4 sm:p-5">
          <p className="eyebrow">{t("whereLive")}</p>
          <div className="flex flex-wrap gap-2" role="group" aria-label={t("district")}>
            <button type="button" className="chip" aria-pressed={district === null} onClick={() => chooseDistrict(null)}>
              {t("allCity")}
            </button>
            {districts.map((d) => (
              <button
                key={d.name}
                type="button"
                className="chip"
                aria-pressed={district === d.name}
                onClick={() => chooseDistrict(district === d.name ? null : d.name)}
              >
                {placeName(d.name)}
                <span className="font-mono text-xs opacity-70">{d.count}</span>
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-subtle" aria-live="polite">
              {currentDistrict
                ? t("inDistrict", { count: currentDistrict.count, district: placeName(currentDistrict.name) })
                : t("hint")}
            </p>
            <Link
              href={district ? `/search?district=${encodeURIComponent(district)}` : "/search"}
              className="btn-primary"
            >
              {t("browse")}
              <Icon name="arrow-right" className="size-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
