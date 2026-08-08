"use client";

import Image from "next/image";

/** Next/Image wrapper that supports public paths and data: URLs */
export default function MediaImage({
  src,
  alt = "",
  fill,
  width,
  height,
  className,
  sizes,
  priority,
  ...rest
}) {
  if (!src) {
    return (
      <div
        className={`bg-[var(--dash-hover)] flex items-center justify-center text-[10px] text-[var(--dash-text-40)] ${className || ""}`}
        style={fill ? { position: "absolute", inset: 0 } : undefined}
      >
        No media
      </div>
    );
  }

  const isData = String(src).startsWith("data:") || String(src).startsWith("blob:");

  if (isData) {
    if (fill) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          className={`absolute inset-0 w-full h-full ${className || ""}`}
          {...rest}
        />
      );
    }
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
        {...rest}
      />
    );
  }

  const isRemote =
    String(src).startsWith("http://") || String(src).startsWith("https://");

  // Absolute remote URLs (signed S3, CDN) — use <img> to avoid next/image host config
  if (isRemote) {
    if (fill) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          className={`absolute inset-0 w-full h-full ${className || ""}`}
          {...rest}
        />
      );
    }
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
        {...rest}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      className={className}
      sizes={sizes}
      priority={priority}
      {...rest}
    />
  );
}
