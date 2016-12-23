'use strict';

// Читаем содержимое package.json в константу
const pjson = require('./package.json');
// Получим из константы другую константу с адресами папок сборки и исходников
const dirs = pjson.config.directories;

// Определим необходимые инструменты
const gulp         = require('gulp');
const sass         = require('gulp-sass');
const rename       = require('gulp-rename');
const sourcemaps   = require('gulp-sourcemaps');
const postcss      = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const mqpacker     = require('css-mqpacker');
const browserSync  = require('browser-sync').create();

// ЗАДАЧА: Компиляция препроцессора
gulp.task('sass', function(){
  return gulp.src(dirs.source + '/scss/style.scss')         // какой файл компилировать (путь из константы)
    .pipe(sourcemaps.init())                                // инициируем карту кода
    .pipe(sass())                                           // компилируем SCSS
    .pipe(rename('style.css'))                              // переименовываем
    .pipe(postcss([                                         // делаем постпроцессинг
        autoprefixer({ browsers: ['last 2 version'] }),     // автопрефиксирование
        mqpacker({ sort: true }),                           // объединение медиавыражений
        ]))
    .pipe(sourcemaps.write('/'))                            // записываем карту кода как отдельный файл (путь из константы)
    .pipe(gulp.dest(dirs.build + '/css/'))                  // записываем CSS-файл (путь из константы)
    .pipe(browserSync.stream());                            // обновляем в браузере
  });

// ЗАДАЧА: Сборка HTML
gulp.task('html', function() {
  return gulp.src(dirs.source + '/*.html')
  .pipe(gulp.dest(dirs.build));
});

// ЗАДАЧА: Перекидываем картинки (временно)
gulp.task('img', function() {
  return gulp.src(dirs.source + '/img/*')
  .pipe(gulp.dest(dirs.build + '/img/'));
});

// ЗАДАЧА: Перекидываем скрипты (временно)
gulp.task('js', function() {
  return gulp.src(dirs.source + '/js/*')
  .pipe(gulp.dest(dirs.build + '/js/'));
});

// ЗАДАЧА: Сборка всего
gulp.task('build', gulp.series(
  'sass', 'img', 'js'
));

// ЗАДАЧА: Локальный сервер, слежение
gulp.task('serve', gulp.series('build', function() {

  browserSync.init({                                        // запускаем локальный сервер (показ, автообновление, синхронизацию)
    server: dirs.build,                                     // папка, которая будет «корнем» сервера (путь из константы)
    port: 3000,                                             // порт, на котором будет работать сервер
    startPath: 'index.html',                                // файл, который буде открываться в браузере при старте сервера
    //open: false,                                            // чтобы при каждом старте сервера в браузере не открывалась новая вкладка со страницей
  });

  gulp.watch(                                               // следим за HTML
    dirs.source + '/*.html',
    gulp.series('html', reloader)                           // при изменении файлов запускаем пересборку HTML и обновление в браузере
    );

  gulp.watch(                                               // следим за SCSS
    dirs.source + '/scss/**/*.scss',
    gulp.series('sass')                                     // при изменении запускаем компиляцию (обновление браузера — в задаче компиляции)
  );

  gulp.watch(                                               // следим за JS (временно)
    dirs.source + '/**/*.js',
    gulp.series('js', reloader)                           // при изменении файлов запускаем пересборку JS и обновление в браузере
    );

}));

// ЗАДАЧА: Задача по умолчанию
gulp.task('default',
  gulp.series('serve')
  );

// Дополнительная функция для перезагрузки в браузере
function reloader(done) {
  browserSync.reload();
  done();
}
