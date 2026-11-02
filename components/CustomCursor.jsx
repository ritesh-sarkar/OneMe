"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "@/context/ThemeContext";
import { getCursorTheme } from "@/libs/cursor-theme";

function getCursorState(target) {
  if (!(target instanceof Element)) return "default";

  const disabled = target.closest(
    ":disabled, [aria-disabled='true'], [aria-busy='true'], [data-loading='true']",
  );
  if (disabled) return "disabled";

  const editable = target.closest(
    "input:not([type='button'], [type='submit'], [type='reset'], [type='checkbox'], [type='radio'], [type='range']), textarea, [contenteditable='true'], select",
  );
  if (editable) return "native";

  if (target.closest("[data-dragging='true'], [draggable='true']")) return "drag";
  if (
    target.closest(
      "a[href], button:enabled, input[type='button']:enabled, input[type='submit']:enabled, input[type='reset']:enabled, input[type='checkbox']:enabled, input[type='radio']:enabled, [role='button']:not([aria-disabled='true']), [role='menuitem'], [role='option'], [role='tab'], [data-cursor-interactive], summary",
    )
  ) {
    return "interactive";
  }
  if (
    target.closest(
      "article, [data-cursor-card], .card-default, .card-interactive, .card-glass, [class~='rounded-2xl'][class~='border']",
    )
  ) {
    return "card";
  }

  return "default";
}

function getThemeAccent(target, fallback) {
  if (target instanceof Element) {
    let element = target;
    while (element && element !== document.documentElement) {
      const accent = element.style.getPropertyValue("--theme-accent").trim();
      if (accent) return accent;
      element = element.parentElement;
    }
  }
  return fallback;
}

export default function CustomCursor() {
  const cursorRef = useRef(null);
  const coreRef = useRef(null);
  const ringRef = useRef(null);
  const trailRef = useRef(null);
  const targetRef = useRef(null);
  const { currentTheme, customOptions } = useTheme();
  const cursorTheme = getCursorTheme(currentTheme?.id, customOptions?.accentColor);
  const accent = cursorTheme.accent;
  const secondary = cursorTheme.secondary;
  const accentRef = useRef(accent);

  useEffect(() => {
    const cursor = cursorRef.current;
    const ring = ringRef.current;
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (!cursor || !ring) return undefined;

    const root = document.documentElement;
    let active = false;
    let lastTarget = null;
    let pointerDown = false;
    let dragging = false;
    let frameId = 0;
    let targetFrameId = 0;
    let pendingPointer = null;
    let pointerPosition = null;

    const setState = (state) => {
      cursor.dataset.state = state;
      if (state !== "native" && state !== "disabled") {
        cursor.dataset.state = dragging ? "drag" : pointerDown ? "pressed" : state;
      }
    };

    const hideCursor = () => {
      cursor.dataset.visible = "false";
    };

    const enable = () => {
      if (!finePointer.matches || reducedMotion.matches) {
        if (active) {
          active = false;
          delete root.dataset.onemeCursor;
          hideCursor();
        }
        return;
      }

      active = true;
      root.dataset.onemeCursor = "active";
    };

    const renderPointer = () => {
      frameId = 0;
      const event = pendingPointer;
      pendingPointer = null;
      if (!active || !event || !coreRef.current || !trailRef.current) return;

      const position = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
      pointerPosition = { x: event.clientX, y: event.clientY };
      coreRef.current.style.transform = position;
      ring.style.transform = position;
      trailRef.current.style.transform = position;
      cursor.dataset.visible = "true";

      const target = event.target;
      if (target !== lastTarget) {
        lastTarget = target;
        targetRef.current = target instanceof Element ? target : null;
        const state = getCursorState(target);
        setState(state);
        cursor.style.setProperty("--cursor-accent", getThemeAccent(target, accentRef.current));
      }
    };

    const move = (event) => {
      if (event.pointerType && event.pointerType !== "mouse" && event.pointerType !== "pen") {
        return;
      }

      if (!active) enable();
      if (!active) return;
      pendingPointer = event;
      if (!frameId) frameId = requestAnimationFrame(renderPointer);
    };

    const press = () => {
      pointerDown = true;
      if (cursor.dataset.state !== "native" && cursor.dataset.state !== "disabled") {
        cursor.dataset.state = "pressed";
      }
    };

    const release = () => {
      pointerDown = false;
      if (lastTarget instanceof Element) setState(getCursorState(lastTarget));
    };

    const leave = (event) => {
      if (!event.relatedTarget) {
        hideCursor();
        lastTarget = null;
        pointerPosition = null;
      }
    };

    const handleDragStart = (event) => {
      if (event.target instanceof Element && cursor.dataset.visible === "true") {
        dragging = true;
        setState(getCursorState(event.target));
      }
    };

    const handleDragEnd = () => {
      dragging = false;
      if (lastTarget instanceof Element) setState(getCursorState(lastTarget));
    };

    const refreshTarget = () => {
      if (!active || !pointerPosition || targetFrameId) return;
      targetFrameId = requestAnimationFrame(() => {
        targetFrameId = 0;
        if (!active || !pointerPosition) return;
        const target = document.elementFromPoint(pointerPosition.x, pointerPosition.y);
        if (!(target instanceof Element) || target === lastTarget) return;
        lastTarget = target;
        targetRef.current = target;
        setState(getCursorState(target));
        cursor.style.setProperty("--cursor-accent", getThemeAccent(target, accentRef.current));
      });
    };

    const handleVisibility = () => {
      if (document.visibilityState !== "visible") hideCursor();
    };

    const handleKeyboardNavigation = () => {
      active = false;
      delete root.dataset.onemeCursor;
      hideCursor();
    };

    enable();
    finePointer.addEventListener("change", enable);
    reducedMotion.addEventListener("change", enable);
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", press, { passive: true });
    window.addEventListener("pointerup", release, { passive: true });
    window.addEventListener("pointercancel", release, { passive: true });
    window.addEventListener("pointerout", leave, { passive: true });
    window.addEventListener("blur", hideCursor);
    window.addEventListener("scroll", refreshTarget, { passive: true, capture: true });
    window.addEventListener("resize", refreshTarget, { passive: true });
    window.addEventListener("dragstart", handleDragStart, true);
    window.addEventListener("dragend", handleDragEnd, true);
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("keydown", handleKeyboardNavigation, true);

    return () => {
      finePointer.removeEventListener("change", enable);
      reducedMotion.removeEventListener("change", enable);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", press);
      window.removeEventListener("pointerup", release);
      window.removeEventListener("pointercancel", release);
      window.removeEventListener("pointerout", leave);
      window.removeEventListener("blur", hideCursor);
      window.removeEventListener("scroll", refreshTarget, true);
      window.removeEventListener("resize", refreshTarget);
      window.removeEventListener("dragstart", handleDragStart, true);
      window.removeEventListener("dragend", handleDragEnd, true);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("keydown", handleKeyboardNavigation, true);
      if (frameId) cancelAnimationFrame(frameId);
      if (targetFrameId) cancelAnimationFrame(targetFrameId);
      delete root.dataset.onemeCursor;
    };
  }, []);

  useEffect(() => {
    accentRef.current = accent;
    if (cursorRef.current) {
      const activeTarget = targetRef.current;
      const updateAccent = () => {
        if (cursorRef.current) {
          cursorRef.current.style.setProperty(
            "--cursor-accent",
            getThemeAccent(activeTarget, accent),
          );
        }
      };
      const frameId = requestAnimationFrame(updateAccent);
      cursorRef.current.style.setProperty("--cursor-secondary", secondary);
      return () => cancelAnimationFrame(frameId);
    }
    return undefined;
  }, [accent, secondary]);

  return (
    <div
      ref={cursorRef}
      className="oneme-cursor"
      data-state="default"
      data-visible="false"
      aria-hidden="true"
    >
      <span
        ref={coreRef}
        className="oneme-cursor__core"
      />
      <span
        ref={ringRef}
        className="oneme-cursor__ring"
      />
      <span
        ref={trailRef}
        className="oneme-cursor__trail"
      />
    </div>
  );
}
