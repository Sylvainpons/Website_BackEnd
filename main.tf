terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "eu-west-3"
}

# ==========================================
# 1. LIRE LA BASE DE DONNÉES EXISTANTE
# ==========================================
# On demande à Terraform de lire les infos de ta BDD existante
data "aws_db_instance" "one_piece_db" {
  db_instance_identifier = "one-piece-database"
}

# On demande à Terraform de lire le pare-feu de ta BDD existante
data "aws_security_group" "rds_sg" {
  name = "one_piece_db_sg"
}

# ==========================================
# 2. CRÉER LE PARE-FEU DU NOUVEAU SERVEUR EC2 (BACKEND)
# ==========================================
resource "aws_security_group" "ec2_sg" {
  name        = "backend_api_sg"
  description = "Allow SSH 22 and API port 8000"

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 8000
    to_port     = 8000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# ==========================================
# 3. CHERCHER LE DERNIER UBUNTU
# ==========================================
data "aws_ami" "ubuntu" {
  most_recent = true
  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }
  owners = ["099720109477"] # Canonical
}

# ==========================================
# 4. CRÉER LE SERVEUR EC2 (Ton API)
# ==========================================
resource "aws_instance" "backend_server" {
  ami             = data.aws_ami.ubuntu.id
  instance_type   = "t3.micro" 
  key_name        = "EC2_one_piece"

  vpc_security_group_ids = [aws_security_group.ec2_sg.id]

  tags = {
    Name = "OnePiece-Backend-API"
    Role = "Backend-Ops"
  }
}

# ==========================================
# 5. LES RÉSULTATS (OUTPUTS)
# ==========================================
output "db_endpoint" {
  description = "L'adresse de connexion de la BDD existante"
  value       = data.aws_db_instance.one_piece_db.endpoint
}

output "backend_public_ip" {
  description = "L'adresse IP publique de ton API"
  value       = aws_instance.backend_server.public_ip
}