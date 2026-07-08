#!/usr/bin/env bash
set -euo pipefail

echo "=== CloudPulse — VM Setup Script ==="
echo ""

read -rp "VM Name (e.g. ubuntu-vm-1): " VM_NAME
read -rp "VM RAM in MB (e.g. 2048): " VM_RAM
read -rp "VM Disk in MB (e.g. 10240): " VM_DISK
read -rp "VM IP (e.g. 192.168.56.101): " VM_IP
read -rp "Path to Ubuntu Server ISO: " ISO_PATH
read -rp "Agent Token: " AGENT_TOKEN

VM_DIR="$HOME/VirtualBox VMs/$VM_NAME"

echo ""
echo "Creating VM: $VM_NAME"
echo "  RAM: ${VM_RAM}MB"
echo "  Disk: ${VM_DISK}MB"
echo "  IP: $VM_IP"
echo ""

VBoxManage createvm --name "$VM_NAME" --ostype Ubuntu_64 --register
VBoxManage modifyvm "$VM_NAME" --memory "$VM_RAM" --cpus 2 --ioapic on
VBoxManage modifyvm "$VM_NAME" --nic1 hostonly --hostonlyadapter1 vboxnet0
VBoxManage modifyvm "$VM_NAME" --nic2 nat

VBoxManage createhd --filename "$VM_DIR/${VM_NAME}.vdi" --size "$VM_DISK"
VBoxManage storagectl "$VM_NAME" --name "SATA" --add sata --controller IntelAhci
VBoxManage storageattach "$VM_NAME" --storagectl "SATA" --port 0 --device 0 --type hdd --medium "$VM_DIR/${VM_NAME}.vdi"
VBoxManage storageattach "$VM_NAME" --storagectl "SATA" --port 1 --device 0 --type dvddrive --medium "$ISO_PATH"

VBoxManage startvm "$VM_NAME" --type headless

echo ""
echo "VM '$VM_NAME' started in headless mode."
echo ""
echo "=== Next Steps (inside the VM) ==="
echo ""
echo "1. During Ubuntu install, set static IP:"
echo "   Address: $VM_IP/24"
echo "   Gateway: 192.168.56.1"
echo "   DNS: 8.8.8.8"
echo ""
echo "2. After install, SSH into the VM:"
echo "   ssh user@$VM_IP"
echo ""
echo "3. Install Bun:"
echo "   curl -fsSL https://bun.sh/install | bash"
echo ""
echo "4. Copy agent to /opt/cloud-pulse-agent"
echo ""
echo "5. Create /opt/cloud-pulse-agent/.env:"
echo "   AGENT_SERVER_URL=http://192.168.56.1:3000"
echo "   AGENT_TOKEN=$AGENT_TOKEN"
echo "   AGENT_TYPE=LOCAL"
echo "   AGENT_INTERVAL=5000"
echo ""
echo "6. Install systemd service:"
echo "   sudo cp /opt/cloud-pulse-agent/systemd/monitoring-agent.service /etc/systemd/system/"
echo "   sudo systemctl daemon-reload"
echo "   sudo systemctl enable --now monitoring-agent"
echo ""
echo "7. Check:"
echo "   sudo systemctl status monitoring-agent"
echo "   journalctl -u monitoring-agent -f"
