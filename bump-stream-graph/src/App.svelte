<script>
  import Viz from './components/Viz.svelte';
</script>

<div class="wrapper">
  <h1>SciLifeLab Publications</h1>
  <h2>Number of papers in SciLifeLab's TOP10 journals.</h2>
  <Viz />
  <footer><a href="https://higsch.com">higsch | data & design, 2020</a></footer>
</div>

<style>
  .wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
  }

  h1 {
    font-family: 'Cormorant Upright', serif;
    font-size: 3rem;
    color: slategrey;
  }

  h2 {
    font-family: 'Cormorant Upright', serif;
    font-size: 1.3rem;
    color: rgb(144, 147, 148);
  }

  footer {
    margin: 2rem 0 0 0;
    font-family: 'Cormorant Upright', serif;
    font-size: 1rem;
  }

  footer a {
    text-decoration: none;
    color: slategrey;
    transition: color 0.2s ease;
  }

  footer a:hover {
    color: #fb8072;
  }
</style>
