data "archive_file" "tidal_audio_extractor_zip" {
  type        = "zip"
  source_dir  = "${path.module}/src/"
  output_path = local.archive_output_path
}

resource "aws_lambda_function" "tidal_audio_extractor" {
  timeout          = 900
  memory_size      = 1664
  runtime          = "provided"
  function_name    = local.function_name
  handler          = "main.handler"
  filename         = local.archive_output_path
  role             = "arn:aws:iam::594206825329:role/lambda-all"
  depends_on       = [aws_cloudwatch_log_group.tidal_audio_extractor]
  source_code_hash = data.archive_file.tidal_audio_extractor_zip.output_base64sha256

  tracing_config {
    mode = "Active"
  }

  layers = [
    "arn:aws:lambda:us-east-1:744348701589:layer:bash:8",
    "arn:aws:lambda:us-east-1:594206825329:layer:ffmpeg:5"
  ]

  vpc_config {
    security_group_ids = [
      "sg-665de11a",
    ]
    subnet_ids = [
      "subnet-00bcc265",
      "subnet-11635158",
      "subnet-2c4a0701",
      "subnet-9446c4a8",
      "subnet-c7275c9c",
      "subnet-fd3a56f1",
    ]
  }
}

resource "aws_cloudwatch_log_group" "tidal_audio_extractor" {
  retention_in_days = 7
  name              = "/aws/lambda/${local.function_name}"
}
