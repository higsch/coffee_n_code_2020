<script>
  export let journals = [];
</script>

<ul class="legend">
  {#each journals as journal}
    <li>
      <div class="color-square" style="background-color: {journal.color};"></div>
      <p>{journal.name}</p>
    </li>
  {/each}
</ul>

<style>
  .legend {
    display: flex;
    justify-content: center;
    width: 100%;
    height: 5%;
    list-style-type: none;
  }

  .legend li {
    display: flex;
    align-items: center;
    margin: 0 0.5rem;
  }

  .color-square {
    width: 1rem;
    height: 1rem;
    border-radius: 2px;
  }

  p {
    margin: 0 0 0 0.3rem;
    font-family: Verdana, sans-serif;
    font-size: 0.8rem;
  }
</style>
