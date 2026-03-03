"""Generate a simple gradient favicon for local development."""

from pathlib import Path
import struct

WIDTH = HEIGHT = 64
PLANES = 1
BIT_COUNT = 32


def build_pixels() -> bytearray:
    pixels = bytearray()
    for y in range(HEIGHT - 1, -1, -1):
        for x in range(WIDTH):
            r = 25 + int(210 * x / (WIDTH - 1))
            g = 10 + int(50 * y / (HEIGHT - 1))
            b = 35 + int(150 * (x + y) / (2 * (WIDTH - 1)))
            pixels += bytes([b & 255, g & 255, r & 255, 255])
    return pixels


def main() -> None:
    pixels = build_pixels()
    mask_row_bytes = ((WIDTH + 31) // 32) * 4
    mask = bytearray(mask_row_bytes * HEIGHT)
    bi_size = 40
    bi_width = WIDTH
    bi_height = HEIGHT * 2
    bi_planes = PLANES
    bi_bitcount = BIT_COUNT
    bi_compression = 0
    bi_size_image = len(pixels) + len(mask)
    bi_xppm = bi_yppm = bi_clr_used = bi_clr_important = 0
    bitmap_header = struct.pack(
        "<IIIHHIIIIII",
        bi_size,
        bi_width,
        bi_height,
        bi_planes,
        bi_bitcount,
        bi_compression,
        bi_size_image,
        bi_xppm,
        bi_yppm,
        bi_clr_used,
        bi_clr_important,
    )
    image_data = bitmap_header + pixels + mask
    bytes_in_res = len(image_data)
    icon_dir = struct.pack("<HHH", 0, 1, 1)
    icon_entry = struct.pack(
        "<BBBBHHII",
        WIDTH if WIDTH < 256 else 0,
        HEIGHT if HEIGHT < 256 else 0,
        0,
        0,
        PLANES,
        BIT_COUNT,
        bytes_in_res,
        6 + 16,
    )
    ico_data = icon_dir + icon_entry + image_data
    Path("app").mkdir(exist_ok=True)
    Path("app/favicon.ico").write_bytes(ico_data)
    print("Wrote app/favicon.ico with", len(ico_data), "bytes")


if __name__ == "__main__":
    main()