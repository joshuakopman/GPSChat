var gulp = require('gulp');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');

gulp.task('compress', function() {
  return gulp.src(['./public/scripts/*.js','./public/views/partials/*.js','./public/views/*.js'])
  	.pipe(concat('client.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('./public/scripts/minified'));
});