#!/bin/bash

# Script untuk menjalankan server dan client (monitoring-server) secara bersamaan.
# Dibuat untuk memudahkan development.

# Warna untuk output terminal yang menarik
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}===============================================${NC}"
echo -e "${BLUE}   CloudPulse Monitoring - Launcher Script     ${NC}"
echo -e "${BLUE}===============================================${NC}"

# 1. Periksa apakah bun terinstall
if ! command -v bun &> /dev/null
then
    echo -e "${RED}Error: 'bun' tidak terinstall di sistem Anda.${NC}"
    echo -e "${YELLOW}Silakan install bun terlebih dahulu: https://bun.sh${NC}"
    exit 1
fi

# 2. Periksa apakah berada di direktori root yang benar
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: File package.json tidak ditemukan!${NC}"
    echo -e "${YELLOW}Pastikan Anda menjalankan script ini dari direktori root project.${NC}"
    exit 1
fi

# 3. Cek node_modules, jika tidak ada maka install otomatis
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}node_modules tidak ditemukan. Menjalankan 'bun install' terlebih dahulu...${NC}"
    bun install
    if [ $? -ne 0 ]; then
        echo -e "${RED}Gagal menginstall dependensi. Silakan periksa koneksi internet Anda.${NC}"
        exit 1
    fi
    echo -e "${GREEN}Dependensi berhasil diinstall!${NC}"
fi

# 4. Jalankan server dan client menggunakan Turborepo
echo -e "${GREEN}Menjalankan server dan client dalam mode development...${NC}"
echo -e "${YELLOW}Tekan Ctrl+C untuk menghentikan server dan client.${NC}"
echo -e "${BLUE}-----------------------------------------------${NC}"

bun dev
