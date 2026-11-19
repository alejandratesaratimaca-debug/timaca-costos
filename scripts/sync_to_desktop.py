import os, time, shutil

src = r"C:\Users\alejandratesara\Desktop\Proyectos externos_FINAL_PULIDO_ACTUALIZADO.pptx"
dst = r"C:\Users\alejandratesara\Desktop\Proyectos externos_FINAL_PULIDO.pptx"

if os.path.exists(src):
    try:
        shutil.copy2(src, dst)
        print("SUCCESS: Overwritten Proyectos externos_FINAL_PULIDO.pptx directly!")
    except Exception as e:
        print("FILE STILL OPEN:", e)
