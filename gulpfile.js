var gulp = require("gulp");
var browserSync = require('browser-sync').create();
var sass =require('gulp-sass');
const imagemin = require('gulp-imagemin');
const sourcemaps = require('gulp-sourcemaps');
const concat = require('gulp-concat');
const newer = require('gulp-newer');
const notify = require('gulp-notify');
const cssnano     = require('gulp-cssnano');
const prefix = require('gulp-autoprefixer');
const del         = require('del');
const debug = require('gulp-debug');
const pug = require('gulp-pug');
const htmlbeautify = require('gulp-html-beautify');
const plumber = require('gulp-plumber');




//задача для удаления папки public до сборки. не прописана в default задаче. значит вручную запускаь надо
gulp.task('clean', function() {
    return del.sync('public'); // Удаляем папку public перед сборкой

});


//задача для оптимизация изображений
gulp.task('images', function() {
	gulp.src('app/img/*.*')
        .pipe(newer('public/img'))
		.pipe(imagemin())
		.pipe(gulp.dest('public/img'));
});


// Компиляция pug

gulp.task('pug', function() {
  return gulp.src("app/pug/*.pug")
    .pipe(plumber({
          errorHandler: notify.onError()
      }))
      // .on('error', notify.onError()) // выдает увидеомление об ошибке + не останавливает gulp
      .pipe(pug())
      .pipe(htmlbeautify())
      .pipe(gulp.dest("app"))

});
// Читаемый html
gulp.task('htmlbeautify', function() {
    var options = {
        indentSize: 2,
        unformatted: [
            // https://www.w3.org/TR/html5/dom.html#phrasing-content
             'abbr', 'area', 'b', 'bdi', 'bdo', 'br', 'cite',
            'code', 'data', 'datalist', 'del', 'dfn', 'em', 'embed', 'i', 'ins', 'kbd', 'keygen', 'map', 'mark', 'math', 'meter', 'noscript',
            'object', 'output', 'progress', 'q', 'ruby', 's', 'samp', 'small',
             'strong', 'sub', 'sup', 'template', 'time', 'u', 'var', 'wbr', 'text',
            'acronym', 'address', 'big', 'dt', 'ins', 'strike', 'tt'
        ]

    };
gulp.src('app/*.html')
    .pipe(htmlbeautify(options))
});

// Запускаем локальный сервер
// Static Server + watching scss/html files/за обоими следит/
gulp.task('serve', ['sass'], function() {

    browserSync.init({
        server: "./public"
//        notify:false,
//        open:false //типо чтоб не открывалось новое окно каждый раз-хотя оно итак не открывается.может при новом запуске gulp?
//        tunnel:true,
//// для быстрого показа клиенту сайта в интернете
       // tunnel: "projectname", //Demonstration page: http://projectname.localtunnel.me
    });


    gulp.watch("app/sass/*.sass", ['sass']);//если изменения в sass
    gulp.watch(['app/pug/*.pug', 'app/include/*.pug'], ['pug']).on('change', browserSync.reload);//если изменения в pug и include/*.pug ! но нес разу после gulp, а после изменения в .pug
    gulp.watch("app/*.html", ['copy_html']).on('change', browserSync.reload);//если изменения в html


    gulp.watch("app/js/*.js", ['copy_js']).on('change', browserSync.reload);//если изменения в js

});
//копирование html файлов
gulp.task('copy_html',function(){
    return gulp.src('app/*.html')
    .pipe(gulp.dest('public'));

});
//копирование js файлов
gulp.task('copy_js',function(){
    return gulp.src('app/js/*.js')
    .pipe(gulp.dest('public/js'));

});
//копирование bower с фильтром старых файлов, которые не нужно копировать
//!!!не знаю если вообще надо копировать
gulp.task('copy_bower', function(){
   return gulp.src('app/bower/**')
    .pipe(newer('public/bower'))
    .pipe(gulp.dest('public/bower'));

});

//копирование папки fonts с фильтром старых файлов, которые не нужно копировать
gulp.task('copy_fonts', function(){
   return gulp.src('app/fonts/**')
    .pipe(newer('public/fonts'))
    .pipe(gulp.dest('public/fonts'));

});

//задача для компиляции sass
// Compile sass into CSS & auto-inject into browsers
gulp.task('sass', function() {
    return gulp.src("app/sass/main.sass") //местонахождение sass файлов
        .pipe(sourcemaps.init())
        .pipe(sass()) //скомпилировать sass
        .on('error', notify.onError()) // выдает увидеомление об ошибке + не останавливает gulp
        .pipe(concat('main.css')) //собираем файлы в 1
        .pipe(prefix(['last 15 versions', '> 5%', 'ie 8', 'ie 7'], { cascade: true })) //Автопрефиксер css
        .pipe(cssnano()) //Минимизация css
        .pipe(sourcemaps.write()) //для браузера чтоб увидеть 2 файла а не один большой
        .pipe(debug({title:'sass:'}))
        .pipe(gulp.dest("public/css")) //положить все в папку public/ css
        .pipe(browserSync.stream()); //далее обновить страничку
});

// Команды по умолчанию- запуск сервера и слежка. все команды которыездесь выполняются при запуске gulp. так как это default команда
gulp.task('default', ['pug', 'serve', 'images',  'copy_html', 'copy_js', 'copy_bower', 'copy_fonts']);/* некоторые команды сразу копируются и не следят больше за фалами. */