let SessionLoad = 1
let s:so_save = &g:so | let s:siso_save = &g:siso | setg so=0 siso=0 | setl so=-1 siso=-1
let v:this_session=expand("<sfile>:p")
silent only
silent tabonly
cd ~/Coding/Web/MarkDone/render
if expand('%') == '' && !&modified && line('$') <= 1 && getline(1) == ''
  let s:wipebuf = bufnr('%')
endif
let s:shortmess_save = &shortmess
if &shortmess =~ 'A'
  set shortmess=aoOA
else
  set shortmess=aoO
endif
badd +131 ~/Coding/Web/MarkDone/render/src/editor/plugins/DefaultPlugin.tsx
badd +33 ~/Coding/Web/MarkDone/render/src/editor/nodes/HeadingNode.tsx
badd +24 ~/Coding/Web/MarkDone/render/src/editor/nodes/QuoteNode.tsx
badd +19 ~/Coding/Web/MarkDone/render/src/editor/plugins/QuotePlugin.tsx
badd +27 ~/Coding/Web/MarkDone/render/src/editor/plugins/HeadingPlugin.tsx
badd +31 ~/Coding/Web/MarkDone/render/src/editor/index.tsx
badd +74 node_modules/lexical/LexicalSelection.d.ts
argglobal
%argdel
edit ~/Coding/Web/MarkDone/render/src/editor/plugins/DefaultPlugin.tsx
let s:save_splitbelow = &splitbelow
let s:save_splitright = &splitright
set splitbelow splitright
wincmd _ | wincmd |
vsplit
1wincmd h
wincmd w
let &splitbelow = s:save_splitbelow
let &splitright = s:save_splitright
wincmd t
let s:save_winminheight = &winminheight
let s:save_winminwidth = &winminwidth
set winminheight=0
set winheight=1
set winminwidth=0
set winwidth=1
exe 'vert 1resize ' . ((&columns * 94 + 94) / 188)
exe 'vert 2resize ' . ((&columns * 93 + 94) / 188)
argglobal
balt ~/Coding/Web/MarkDone/render/src/editor/plugins/QuotePlugin.tsx
setlocal fdm=indent
setlocal fde=0
setlocal fmr={{{,}}}
setlocal fdi=#
setlocal fdl=99
setlocal fml=1
setlocal fdn=20
setlocal fen
8
normal! zo
10
normal! zo
15
normal! zo
15
normal! zc
75
normal! zo
77
normal! zo
85
normal! zo
101
normal! zo
104
normal! zo
106
normal! zo
114
normal! zo
120
normal! zo
let s:l = 86 - ((82 * winheight(0) + 25) / 51)
if s:l < 1 | let s:l = 1 | endif
keepjumps exe s:l
normal! zt
keepjumps 86
normal! 033|
wincmd w
argglobal
if bufexists(fnamemodify("~/Coding/Web/MarkDone/render/src/editor/plugins/HeadingPlugin.tsx", ":p")) | buffer ~/Coding/Web/MarkDone/render/src/editor/plugins/HeadingPlugin.tsx | else | edit ~/Coding/Web/MarkDone/render/src/editor/plugins/HeadingPlugin.tsx | endif
if &buftype ==# 'terminal'
  silent file ~/Coding/Web/MarkDone/render/src/editor/plugins/HeadingPlugin.tsx
endif
balt ~/Coding/Web/MarkDone/render/src/editor/plugins/QuotePlugin.tsx
setlocal fdm=indent
setlocal fde=0
setlocal fmr={{{,}}}
setlocal fdi=#
setlocal fdl=99
setlocal fml=1
setlocal fdn=20
setlocal fen
7
normal! zo
9
normal! zo
10
normal! zo
14
normal! zo
19
normal! zo
let s:l = 31 - ((30 * winheight(0) + 25) / 51)
if s:l < 1 | let s:l = 1 | endif
keepjumps exe s:l
normal! zt
keepjumps 31
normal! 0
wincmd w
exe 'vert 1resize ' . ((&columns * 94 + 94) / 188)
exe 'vert 2resize ' . ((&columns * 93 + 94) / 188)
tabnext 1
if exists('s:wipebuf') && len(win_findbuf(s:wipebuf)) == 0 && getbufvar(s:wipebuf, '&buftype') isnot# 'terminal'
  silent exe 'bwipe ' . s:wipebuf
endif
unlet! s:wipebuf
set winheight=1 winwidth=10
let &shortmess = s:shortmess_save
let &winminheight = s:save_winminheight
let &winminwidth = s:save_winminwidth
let s:sx = expand("<sfile>:p:r")."x.vim"
if filereadable(s:sx)
  exe "source " . fnameescape(s:sx)
endif
let &g:so = s:so_save | let &g:siso = s:siso_save
set hlsearch
nohlsearch
doautoall SessionLoadPost
unlet SessionLoad
" vim: set ft=vim :
