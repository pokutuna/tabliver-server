var gulp       = require('gulp'),
    typescript = require('gulp-typescript');

gulp.task('default', ['build', 'watch']);

var tsProject = typescript.createProject({ module: 'commonjs', typescript: require('typescript') });
gulp.task('typescript', function() {
    return gulp.src('*.ts')
        .pipe(typescript(tsProject))
        .js.pipe(gulp.dest('./'));
});

gulp.task('build', ['typescript']);

gulp.task('watch', function() {
    gulp.watch('./**/*.ts', ['typescript']);
});
