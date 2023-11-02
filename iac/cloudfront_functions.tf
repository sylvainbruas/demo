resource "aws_cloudfront_function" "redirect-index" {
  name    = "redirect-index"
  runtime = "cloudfront-js-1.0"
  comment = "add missing index.html at the end of url"
  publish = true
  code    = file("../functions/cloudfront/index.js")
}