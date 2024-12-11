resource "local_file" "entrypoint" {
  content = templatefile("${path.module}/../../matbas.sh.tftpl", {
    matbas_build = var.matbas_build
  })
  filename = var.path
}
